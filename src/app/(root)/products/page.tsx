'use client';
import React, { useState } from 'react';
import ButtonAdd from '@/app/components/btn-add/ButtonAdd';
import ProtectedRoute from '@/utils/ProtectedRoute';
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
import EditModal from '@/app/components/modal-edit/ModalEdit';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { Category } from '@/types/category';
import { getAllCategory } from '@/app/api/category/getCategory';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './product.scss';

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

const ProductComponent: React.FC = () => {
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

	const handleMoveAddProduct = () => {
		router.push('/add-form');
	};

	const handleOpen = (product: Product) => {
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
	};

	const handleClose = () => {
		setOpen(false);
		setSelectedProduct(null);
		setImagePreviewUrls([]);
		setSelectedFiles([]);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setProductDetails({
			...productDetails,
			[e.target.name]: e.target.value,
		});
	};

	const handleCategoryChange = (event: React.ChangeEvent<{}>, value: Category[]) => {
		setProductDetails((prevDetails) => ({
			...prevDetails,
			category: value,
		}));
	};

	const handleEditorChange = (value: string) => {
		setProductDetails({
			...productDetails,
			description: value,
		});
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.some((file) => file.size > 50 * 1024 * 1024)) {
			alert('Some files are too large');
			return;
		}
		setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
		const urls = files.map((file) => URL.createObjectURL(file));
		setImagePreviewUrls((prevUrls) => [...prevUrls, ...urls]);
	};

	const { data, isLoading, error } = useQuery<Product[]>({
		queryKey: ['listProducts'],
		queryFn: getAllProducts,
		select: (products) =>
			products.map((product) => ({
				...product,
				category: Array.isArray(product.category) ? product.category : [],
			})),
	});

	const { data: categories } = useQuery<Category[] | undefined>({
		queryKey: ['listCategories'],
		queryFn: getAllCategory,
	});

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
		setImagePreviewUrls(updatedPreviewUrls);

		setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));

		setProductDetails((prevDetails) => ({
			...prevDetails,
			imageUrls: updatedPreviewUrls,
		}));
	};

	const hasChanges = () => {
		return (
			JSON.stringify(productDetails) !== JSON.stringify(originalProductDetails) ||
			!imagePreviewUrls.every((url, index) => url === originalProductDetails.imageUrls[index])
		);
	};

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
	};

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error loading products</div>;

	// Pagination logic
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem);

	const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

	return (
		<div className='product'>
			<ButtonAdd title='Sản phẩm' nameBtn='Thêm sản phẩm' onClick={handleMoveAddProduct} />
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Id</TableCell>
							<TableCell>Tên sản phẩm</TableCell>
							<TableCell>Hình ảnh</TableCell>
							<TableCell>Giá</TableCell>
							<TableCell>Giá Giảm</TableCell>
							{/* <TableCell>Category</TableCell> */}
							<TableCell></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{currentItems?.map((product) => (
							<TableRow key={product._id}>
								<TableCell className='truncate-cell'>{product._id}</TableCell>
								<TableCell className='truncate-cell'>{product.title}</TableCell>
								<TableCell className='truncate-cell'>
									{product.imageUrls && product.imageUrls.length > 0 && (
										<div>
											<Image
												src={product.imageUrls[0]}
												width={150}
												height={80}
												alt='image'
												priority
											/>
										</div>
									)}
								</TableCell>
								<TableCell className='truncate-cell'>{formatCurrency(product.price)}</TableCell>
								<TableCell className='truncate-cell'>{formatCurrency(product.discountPrice)}</TableCell>
								{/* <TableCell className='truncate-cell'>
										{Array.isArray(product.category)
											? product.category.map((cat) => cat.name).join(', ')
											: ''}
									</TableCell> */}
								<TableCell>
									<IconButton
										onClick={() => handleOpen(product)}
										className='icon-button'
										aria-label='edit'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(product._id)}
										className='icon-button'
										aria-label='delete'
									>
										<DeleteIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Stack direction='row' spacing={2} justifyContent='center' alignItems='center' mt={2}>
				<Button
					className='pagination-button'
					variant='contained'
					color='primary'
					disabled={currentPage === 1}
					onClick={() => handlePageChange(currentPage - 1)}
				>
					Previous
				</Button>
				<Typography variant='body1' className='pagination-text'>
					Page {currentPage} of {totalPages}
				</Typography>
				<Button
					className='pagination-button'
					variant='contained'
					color='primary'
					disabled={currentPage === totalPages}
					onClick={() => handlePageChange(currentPage + 1)}
				>
					Next
				</Button>
			</Stack>

			<EditModal
				open={open}
				handleClose={handleClose}
				handleSave={handleSave}
				productDetails={productDetails}
				handleChange={handleChange}
				handleCategoryChange={handleCategoryChange}
				handleEditorChange={handleEditorChange}
				handleFileChange={handleFileChange}
				imagePreviewUrls={imagePreviewUrls}
				handleImageRemove={handleImageRemove}
				categories={categories || []}
				hasChanges={hasChanges}
				selectedFiles={selectedFiles}
				setSelectedFiles={setSelectedFiles}
				setImagePreviewUrls={setImagePreviewUrls}
			/>
		</div>
	);
};

export default ProtectedRoute(ProductComponent);
