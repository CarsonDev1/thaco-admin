import React from 'react';
import { VscClose } from 'react-icons/vsc';
import { Modal, Button, TextField, Autocomplete } from '@mui/material';
import Image from 'next/image';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the Quill CSS
import { Product } from '@/types/product';
import { Category } from '@/types/category';

interface EditModalProps {
	open: boolean;
	handleClose: () => void;
	productDetails: Omit<Product, '_id'>;
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	selectedFiles: File[];
	setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
	handleSave: () => void;
	imagePreviewUrls: string[];
	setImagePreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
	hasChanges: () => boolean;
	handleEditorChange: (value: string) => void;
	handleImageRemove: (index: number) => void;
	categories: Category[] | undefined;
	handleCategoryChange: (event: React.ChangeEvent<{}>, value: Category[]) => void;
}

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

const EditModal: React.FC<EditModalProps> = ({
	open,
	handleClose,
	productDetails,
	handleChange,
	handleFileChange,
	handleSave,
	imagePreviewUrls,
	setImagePreviewUrls,
	selectedFiles,
	setSelectedFiles,
	hasChanges,
	handleEditorChange,
	handleImageRemove,
	categories,
	handleCategoryChange,
}) => {
	return (
		<Modal
			open={open}
			onClose={handleClose}
			sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
		>
			<div className='modal'>
				<div className='modal-header'>
					<h2>Chỉnh sửa</h2>
					<VscClose className='icon-close-modal' onClick={handleClose} />
				</div>
				<TextField
					label='Tên sản phẩm'
					name='title'
					value={productDetails.title}
					onChange={handleChange}
					fullWidth
				/>
				<div className='description-editor'>
					<ReactQuill
						value={productDetails.description}
						onChange={handleEditorChange}
						modules={modules}
						formats={formats}
					/>
				</div>
				<div className='file-input'>
					<input type='file' accept='image/*' onChange={handleFileChange} multiple />
					{imagePreviewUrls && imagePreviewUrls.length > 0 && (
						<div className='image-preview-container'>
							{imagePreviewUrls.map((url, index) => (
								<div key={index} className='image-preview-item'>
									<Image
										width={150}
										height={80}
										src={url}
										alt='image'
										className='image-preview'
										priority
									/>
									<Button onClick={() => handleImageRemove(index)} className='image-remove-btn'>
										Xóa
									</Button>
								</div>
							))}
						</div>
					)}
				</div>
				<TextField
					label='Giá'
					name='price'
					type='number'
					value={productDetails.price}
					onChange={handleChange}
					fullWidth
					inputProps={{ min: '0', step: 'any' }}
					sx={{
						'& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button': {
							WebkitAppearance: 'none',
							margin: 0,
						},
						'& input': {
							MozAppearance: 'textfield',
						},
					}}
				/>
				<Autocomplete
					multiple
					options={categories || []}
					getOptionLabel={(option) => option.name}
					value={productDetails.category}
					onChange={handleCategoryChange}
					renderInput={(params) => <TextField {...params} label='Loại Sản Phẩm' />}
				/>
				<div className='modal-btn-wrap'>
					<Button onClick={handleSave} disabled={!hasChanges()} className='modal-btn-save'>
						Lưu
					</Button>
					<Button onClick={handleClose} className='modal-btn-cancel'>
						Hủy
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default EditModal;
