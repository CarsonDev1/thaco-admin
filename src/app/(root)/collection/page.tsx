'use client';
import React, { useState, ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	TextField,
	Modal,
	CircularProgress,
	IconButton,
	Box,
} from '@mui/material';
import { getAllCategory } from '@/app/api/category/getCategory';
import { updateCategory } from '@/app/api/category/updateCategory';
import { Category } from '@/types/category';
import Swal from 'sweetalert2';
import { createCategory } from '@/app/api/category/createCategory';
import { deleteCategory } from '@/app/api/category/deleteCategory';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './Collection.module.scss';

type CategoryFormData = {
	name: string;
	description: string;
};

const Collection: React.FC = () => {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState<boolean>(false);
	const [isAdding, setIsAdding] = useState<boolean>(false);
	const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
	const [formData, setFormData] = useState<CategoryFormData>({ name: '', description: '' });

	const {
		data: categories,
		isLoading,
		isError,
	} = useQuery<Category[]>({
		queryKey: ['listCategories'],
		queryFn: getAllCategory,
	});

	const { mutate: mutateUpdateCategory } = useMutation({
		mutationFn: async ({ id, categoryDetails }: { id: string; categoryDetails: CategoryFormData }) => {
			const formData = new FormData();
			formData.append('name', categoryDetails.name);
			formData.append('description', categoryDetails.description);

			try {
				await updateCategory({ id, categoryDetails: formData });
			} catch (error) {
				console.error('Error during category update:', error);
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['listCategories'] as unknown as InvalidateQueryFilters);
			handleClose();
			Swal.fire({
				title: 'Success!',
				text: 'Category updated successfully.',
				icon: 'success',
				confirmButtonText: 'OK',
			});
		},
		onError: (error: any) => {
			console.error('Error updating category:', error);
			Swal.fire({
				title: 'Error!',
				text: 'There was an error updating the category.',
				icon: 'error',
				confirmButtonText: 'OK',
			});
		},
	});

	const { mutate: mutateCreateCategory } = useMutation({
		mutationFn: async (categoryDetails: CategoryFormData) => {
			const formData = new FormData();
			formData.append('name', categoryDetails.name);
			formData.append('description', categoryDetails.description);

			try {
				await createCategory(formData);
			} catch (error) {
				console.error('Error during category creation:', error);
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['listCategories'] as unknown as InvalidateQueryFilters);
			handleClose();
			Swal.fire({
				title: 'Success!',
				text: 'Category created successfully.',
				icon: 'success',
				confirmButtonText: 'OK',
			});
		},
		onError: (error: any) => {
			console.error('Error creating category:', error);
			Swal.fire({
				title: 'Error!',
				text: 'There was an error creating the category.',
				icon: 'error',
				confirmButtonText: 'OK',
			});
		},
	});

	const { mutate: mutateDeleteCategory } = useMutation({
		mutationFn: async (id: string) => {
			try {
				await deleteCategory(id);
			} catch (error) {
				console.error('Error during category deletion:', error);
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['listCategories'] as unknown as InvalidateQueryFilters);
			Swal.fire({
				title: 'Success!',
				text: 'Category deleted successfully.',
				icon: 'success',
				confirmButtonText: 'OK',
			});
		},
		onError: (error: any) => {
			console.error('Error deleting category:', error);
			Swal.fire({
				title: 'Error!',
				text: 'There was an error deleting the category.',
				icon: 'error',
				confirmButtonText: 'OK',
			});
		},
	});

	const handleOpen = (category?: Category) => {
		if (category) {
			setCurrentCategory(category);
			setFormData({ name: category.name, description: category.description });
		} else {
			setCurrentCategory(null);
			setFormData({ name: '', description: '' });
		}
		setIsAdding(!category);
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setCurrentCategory(null);
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name as keyof CategoryFormData]: value,
		}));
	};

	const handleSubmit = () => {
		if (isAdding) {
			mutateCreateCategory(formData);
		} else if (currentCategory) {
			mutateUpdateCategory({
				id: currentCategory._id,
				categoryDetails: formData,
			});
		}
	};

	const handleDelete = (id: string) => {
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, delete it!',
			cancelButtonText: 'No, cancel!',
		}).then((result) => {
			if (result.isConfirmed) {
				mutateDeleteCategory(id);
			}
		});
	};

	if (isLoading) return <CircularProgress />;
	if (isError) return <div>Error loading data</div>;

	return (
		<div className={styles.container}>
			<Button className={styles.addButton} onClick={() => handleOpen()} variant='contained'>
				Thêm Loại Sản Phẩm
			</Button>

			<TableContainer component={Paper} className={styles.tableContainer}>
				<Table>
					<TableHead className={styles.tableHead}>
						<TableRow>
							<TableCell className={styles.tableHeadCell}>ID</TableCell>
							<TableCell className={styles.tableHeadCell}>Tên Loại Sản Phẩm</TableCell>
							<TableCell className={styles.tableHeadCell}>Mô tả</TableCell>
							<TableCell className={styles.tableHeadCell}></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{categories?.map((category) => (
							<TableRow key={category._id}>
								<TableCell>{category._id}</TableCell>
								<TableCell>{category.name}</TableCell>
								<TableCell>{category.description}</TableCell>
								<TableCell>
									<IconButton className={styles.button} onClick={() => handleDelete(category._id)}>
										<DeleteIcon className={styles.svgIcon} />
									</IconButton>
									{/* <Button onClick={() => handleOpen(category)}>Edit</Button> */}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Modal open={open} onClose={handleClose} aria-labelledby='modal-title' aria-describedby='modal-description'>
				<Box className={styles.modalContainer}>
					<h2 id='modal-title' className={styles.modalTitle}>
						{isAdding ? 'Add Category' : 'Edit Category'}
					</h2>
					<TextField
						label='Tên loại sản phẩm'
						fullWidth
						name='name'
						value={formData.name}
						onChange={handleChange}
						margin='normal'
						className={styles.textField}
					/>
					<TextField
						label='Mô tả'
						fullWidth
						name='description'
						value={formData.description}
						onChange={handleChange}
						margin='normal'
						className={styles.textField}
					/>
					<div className={styles.modalActions}>
						<Button
							onClick={handleSubmit}
							variant='contained'
							color='primary'
							className={styles.submitButton}
						>
							Submit
						</Button>
						<Button
							onClick={handleClose}
							variant='outlined'
							color='secondary'
							className={styles.cancelButton}
						>
							Cancel
						</Button>
					</div>
				</Box>
			</Modal>
		</div>
	);
};

export default Collection;
