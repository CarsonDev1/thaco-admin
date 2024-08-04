'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@/types/category';
import { getAllCategory } from '@/app/api/category/getCategory';
import { TextField, MenuItem, Box, Typography, Grid } from '@mui/material';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Swal from 'sweetalert2';
import './add-form.scss';

// Define a custom-styled button using the styled API
const CustomButton = styled(Button)(({ loading }: { loading?: boolean }) => ({
	background: '#3b82f6',
	border: 0,
	borderRadius: 3,
	boxShadow: '0 3px 5px 2px rgba(59, 130, 246, .3)',
	color: 'white',
	height: 48,
	padding: '0 30px',
	position: 'relative',
	overflow: 'hidden',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	transition: 'background 0.3s ease',
	'&:hover': {
		background: '#2563eb',
		boxShadow: '0 6px 10px 4px rgba(59, 130, 246, .3)',
	},
	'&:before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: '-100%',
		width: '100%',
		height: '100%',
		background: 'linear-gradient(to right, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0))',
		transition: 'left 0.5s ease',
		zIndex: 1,
	},
	'&:hover::before': {
		left: '100%',
	},
	'&.loading': {
		background: 'rgba(59, 130, 246, 0.5)',
		color: 'transparent',
		'&:hover': {
			background: 'rgba(59, 130, 246, 0.5)',
		},
	},
}));

const AddForm: React.FC = () => {
	const [title, setTitle] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [price, setPrice] = useState<number | undefined>(undefined);
	const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
	const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
	const [images, setImages] = useState<File[]>([]);
	const [video, setVideo] = useState<File | null>(null);
	const [size, setSize] = useState<string>('');
	const [loadCapacity, setLoadCapacity] = useState<string>('');
	const [engine, setEngine] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	const { data: categories } = useQuery<Category[] | undefined>({
		queryKey: ['listCategories'],
		queryFn: getAllCategory,
	});

	const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setImages(Array.from(e.target.files));
		}
	};

	const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setVideo(e.target.files[0]);
		}
	};

	const handleDescriptionChange = (value: string) => {
		setDescription(value);
	};

	const handleNumberChange =
		(setter: React.Dispatch<React.SetStateAction<number | undefined>>) => (e: ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			if (/^\d*\.?\d*$/.test(value)) {
				setter(value ? Number(value) : undefined);
			}
		};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		if (price !== undefined) {
			formData.append('price', price.toString());
		}
		if (discountPrice !== undefined) {
			formData.append('discountPrice', discountPrice.toString());
		}
		formData.append('category', selectedCategoryId);
		formData.append('size', size);
		formData.append('loadCapacity', loadCapacity);
		formData.append('engine', engine);

		images.forEach((image) => {
			formData.append('image', image);
		});

		if (video) {
			formData.append('video', video);
		}

		setLoading(true);

		try {
			const response = await axios.post('https://thaco-be.onrender.com/api/products/create', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			console.log('Product created:', response.data);

			Swal.fire({
				icon: 'success',
				title: 'Success',
				text: 'Product added successfully!',
			});

			setTitle('');
			setDescription('');
			setPrice(undefined);
			setDiscountPrice(undefined);
			setSelectedCategoryId('');
			setImages([]);
			setVideo(null);
			setSize('');
			setLoadCapacity('');
			setEngine('');
		} catch (error) {
			console.error('Error creating product:', error);

			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Failed to add product. Please try again.',
			});
		} finally {
			setLoading(false);
		}
	};

	const modules = {
		toolbar: [
			[{ header: '1' }, { header: '2' }, { font: [] }],
			[{ list: 'ordered' }, { list: 'bullet' }],
			['bold', 'italic', 'underline'],
			['link', 'image'],
			[{ align: [] }],
		],
	};

	const formats = ['header', 'font', 'list', 'bullet', 'bold', 'italic', 'underline', 'link', 'image', 'align'];

	return (
		<Box component='form' onSubmit={handleSubmit} className='add-form'>
			<Typography variant='h5' sx={{ mb: 2 }}>
				Thêm sản phẩm
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<TextField
						label='Tên sản phẩm'
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						fullWidth
						required
					/>
				</Grid>
				<Grid item xs={12}>
					<ReactQuill
						value={description}
						onChange={handleDescriptionChange}
						modules={modules}
						formats={formats}
						style={{ marginBottom: '16px' }}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label='Giá'
						type='number'
						value={price ?? ''}
						onChange={handleNumberChange(setPrice)}
						fullWidth
						required
						inputProps={{ min: 0 }}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label='Giá Giảm'
						type='number'
						value={discountPrice ?? ''}
						onChange={handleNumberChange(setDiscountPrice)}
						fullWidth
						inputProps={{ min: 0 }}
					/>
				</Grid>
				<Grid item xs={6}>
					<TextField
						select
						label='Loại Sản Phẩm'
						value={selectedCategoryId}
						onChange={(e) => setSelectedCategoryId(e.target.value)}
						fullWidth
						required
					>
						<MenuItem value='' disabled>
							Chọn loại sản phẩm
						</MenuItem>
						{categories?.map((category) => (
							<MenuItem key={category._id} value={category._id}>
								{category.name}
							</MenuItem>
						))}
					</TextField>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label='Kích Thước'
						value={size}
						onChange={(e) => setSize(e.target.value)}
						fullWidth
						required
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label='Dung Tải'
						value={loadCapacity}
						onChange={(e) => setLoadCapacity(e.target.value)}
						fullWidth
						required
					/>
				</Grid>
				<Grid item xs={6}>
					<TextField
						label='Động Cơ'
						value={engine}
						onChange={(e) => setEngine(e.target.value)}
						fullWidth
						required
					/>
				</Grid>
				<Grid item xs={12}>
					<TextField
						type='file'
						inputProps={{ multiple: true }}
						onChange={handleImageChange}
						fullWidth
						required
						label='Hình Ảnh'
						InputLabelProps={{ shrink: true }}
					/>
				</Grid>
				{/* <Grid item xs={6}>
					<TextField
						type='file'
						onChange={handleVideoChange}
						fullWidth
						label='Video'
						InputLabelProps={{ shrink: true }}
					/>
				</Grid> */}
				<Grid item xs={12}>
					<CustomButton
						type='submit'
						variant='contained'
						fullWidth
						className={`${loading ? 'loading loading-button' : ''}`}
						loading={loading}
					>
						{loading ? <CircularProgress size={24} color='success' className='spinner' /> : 'Thêm Sản Phẩm'}
					</CustomButton>
				</Grid>
			</Grid>
		</Box>
	);
};

export default AddForm;
