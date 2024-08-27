'use client';
import React, { useState, useCallback, useEffect } from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	IconButton,
	Typography,
	Stack,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { getAllProducts } from '@/app/api/product/getProducts';
import { updateProduct } from '@/app/api/product/updateProduct';
import { deleteProduct } from '@/app/api/product/deleteProduct';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Image from 'next/image';
import ButtonAdd from '@/app/components/btn-add/ButtonAdd';
import dynamic from 'next/dynamic';
import { Category } from '@/types/category';
import { getAllCategory } from '@/app/api/category/getCategory';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './product.scss';
import { isEqual } from 'lodash';

// Dynamic import for EditModal to ensure it's only rendered on the client side
const EditModal = dynamic(() => import('@/app/components/modal-edit/ModalEdit'), { ssr: false });

interface Product {
	_id: string;
	title: string;
	description: string;
	imageUrls: string[];
	price: number;
	discountPrice: number;
	category: Category[];
}

const formatCurrency = (value: number) => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
};

const Product: React.FC = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [open, setOpen] = useState<boolean>(false);
	const [productDetails, setProductDetails] = useState<Omit<Product, '_id'>>({
		title: '',
		description: '',
		imageUrls: [],
		price: 0,
		category: [],
		discountPrice: 0,
	});
	const [originalProductDetails, setOriginalProductDetails] = useState<Omit<Product, '_id'>>({
		title: '',
		description: '',
		imageUrls: [],
		price: 0,
		category: [],
		discountPrice: 0,
	});
	const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const itemsPerPage = 4;
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const {
		data: products,
		isLoading,
		error,
	} = useQuery<Product[]>({
		queryKey: ['listProducts'],
		queryFn: getAllProducts,
		select: (products) =>
			products.map((product) => ({
				...product,
				category: Array.isArray(product.category) ? product.category : [],
			})),
	});

	const { data: categories } = useQuery<Category[]>({
		queryKey: ['listCategories'],
		queryFn: getAllCategory,
	});

	const handleMoveAddProduct = () => {
		router.push('/add-form');
	};

	const handleOpen = useCallback(
		(product: Product) => {
			setSelectedProduct(product);

			const selectedCategories =
				categories?.filter((cat) => product.category.some((prodCat) => prodCat._id === cat._id)) || [];

			setOriginalProductDetails({
				title: product.title,
				description: product.description,
				imageUrls: product.imageUrls,
				price: product.price,
				category: selectedCategories,
				discountPrice: product.discountPrice,
			});

			setProductDetails({
				title: product.title,
				description: product.description,
				imageUrls: product.imageUrls,
				price: product.price,
				category: selectedCategories,
				discountPrice: product.discountPrice,
			});

			setImagePreviewUrls(product.imageUrls);
			setSelectedFiles([]);
			setOpen(true);
		},
		[categories]
	);

	const handleClose = () => {
		setOpen(false);
		setSelectedProduct(null);
		setImagePreviewUrls([]);
		setSelectedFiles([]);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setProductDetails((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleCategoryChange = (event: React.ChangeEvent<{}>, value: Category[]) => {
		setProductDetails((prevDetails) => ({
			...prevDetails,
			category: value,
		}));
	};

	const handleEditorChange = (value: string) => {
		setProductDetails((prevDetails) => ({
			...prevDetails,
			description: value,
		}));
	};

	const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if (typeof window !== 'undefined') {
			const files = Array.from(e.target.files || []);
			if (files.some((file) => file.size > 50 * 1024 * 1024)) {
				alert('Some files are too large');
				return;
			}
			setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
			const urls = files.map((file) => URL.createObjectURL(file));
			setImagePreviewUrls((prevUrls) => [...prevUrls, ...urls]);
		}
	}, []);

	const { mutate: mutateUpdateProduct } = useMutation({
		mutationFn: updateProduct,
		onSuccess: () => {
			handleClose();
			Swal.fire({
				title: 'Success!',
				text: 'Product updated successfully.',
				icon: 'success',
				confirmButtonText: 'OK',
			}).then(() => {
				queryClient.invalidateQueries(['listProducts'] as unknown as InvalidateQueryFilters);
			});
		},
		onError: (error: any) => {
			console.error('Error updating product:', error.response?.data || error.message);
			Swal.fire({
				title: 'Error!',
				text: 'There was an error updating the product.',
				icon: 'error',
				confirmButtonText: 'OK',
			});
		},
	});

	const { mutate: mutateDeleteProduct } = useMutation({
		mutationFn: deleteProduct,
		onSuccess: () => {
			console.log('Product deleted successfully');
			queryClient.invalidateQueries(['listProducts'] as unknown as InvalidateQueryFilters);
		},
		onError: (error: any) => {
			console.error('Error deleting product:', error);
		},
	});

	const handleSave = () => {
		if (selectedProduct) {
			const formData = new FormData();
			formData.append('title', productDetails.title);
			formData.append('description', productDetails.description);
			formData.append('price', productDetails.price.toString());
			formData.append('discountPrice', productDetails.discountPrice.toString());
			formData.append('category', JSON.stringify(productDetails.category));

			selectedFiles.forEach((file) => {
				formData.append('image', file);
			});

			const updatedImageUrls = imagePreviewUrls.filter((url) => !originalProductDetails.imageUrls.includes(url));
			formData.append('imageUrls', JSON.stringify(updatedImageUrls));
			formData.append('originalImageUrls', JSON.stringify(originalProductDetails.imageUrls));

			mutateUpdateProduct({ id: selectedProduct._id, productDetails: formData });
		}
	};

	const handleDelete = (id: string) => {
		Swal.fire({
			title: 'Bạn có chắc không?',
			text: 'Bạn sẽ không thể hoàn tác điều này!',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Vâng, xóa nó đi!',
		}).then((result) => {
			if (result.isConfirmed) {
				mutateDeleteProduct(id);
				Swal.fire('Đã xóa!', 'Sản phẩm đã bị xóa.', 'success');
			}
		});
	};

	const handleImageRemove = (index: number) => {
		const updatedPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
		const updatedSelectedFiles = selectedFiles.filter((_, i) => i !== index);

		setImagePreviewUrls(updatedPreviewUrls);
		setSelectedFiles(updatedSelectedFiles);
	};

	const totalPages = Math.ceil((products?.length || 0) / itemsPerPage);
	const displayedProducts = products?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	const handleChangePage = (newPage: number) => {
		setCurrentPage(newPage);
	};

	return (
		<div className='product-admin-container'>
			<Stack direction='row' justifyContent='space-between' alignItems='center'>
				<Typography variant='h4' gutterBottom>
					Quản lý sản phẩm
				</Typography>
				<Button variant='contained' color='primary' onClick={handleMoveAddProduct}>
					Thêm sản phẩm
				</Button>
			</Stack>
			<TableContainer component={Paper} className='table-container'>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Hình ảnh</TableCell>
							<TableCell>Tên sản phẩm</TableCell>
							<TableCell>Giá</TableCell>
							<TableCell>Giảm giá</TableCell>
							<TableCell>Thao tác</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{isLoading && (
							<TableRow>
								<TableCell colSpan={5} align='center'>
									Loading...
								</TableCell>
							</TableRow>
						)}
						{error && (
							<TableRow>
								<TableCell colSpan={5} align='center'>
									Error loading products
								</TableCell>
							</TableRow>
						)}
						{displayedProducts?.map((product) => (
							<TableRow key={product._id}>
								<TableCell>
									<Image
										src={product.imageUrls[0] || '/placeholder.png'}
										alt={product.title}
										width={50}
										height={50}
										style={{ objectFit: 'cover' }}
									/>
								</TableCell>
								<TableCell>{product.title}</TableCell>
								<TableCell>{formatCurrency(product.price)}</TableCell>
								<TableCell>{formatCurrency(product.discountPrice)}</TableCell>
								<TableCell>
									<IconButton onClick={() => handleOpen(product)}>
										<EditIcon />
									</IconButton>
									<IconButton onClick={() => handleDelete(product._id)}>
										<DeleteIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<Stack direction='row' justifyContent='center' spacing={2} className='pagination'>
				<Button disabled={currentPage === 1} onClick={() => handleChangePage(currentPage - 1)}>
					Previous
				</Button>
				<Typography variant='body1'>
					Page {currentPage} of {totalPages}
				</Typography>
				<Button disabled={currentPage === totalPages} onClick={() => handleChangePage(currentPage + 1)}>
					Next
				</Button>
			</Stack>
			{isClient && (
				<EditModal
					open={open}
					handleClose={handleClose}
					productDetails={productDetails}
					handleSave={handleSave}
					handleChange={handleChange}
					handleCategoryChange={handleCategoryChange}
					handleEditorChange={handleEditorChange}
					imagePreviewUrls={imagePreviewUrls}
					handleFileChange={handleFileChange}
					handleImageRemove={handleImageRemove}
					selectedFiles={selectedFiles}
					setSelectedFiles={setSelectedFiles}
					setImagePreviewUrls={setImagePreviewUrls}
					hasChanges={() => !isEqual(productDetails, originalProductDetails)}
					categories={categories || []}
				/>
			)}
		</div>
	);
};

export default Product;
