import React from 'react';
import { Button, Stack, Typography } from '@mui/material';

interface IButtonAdd {
	title: string;
	nameBtn: string;
	onClick: () => void;
}

const ButtonAdd: React.FC<IButtonAdd> = ({ title, nameBtn, onClick }) => {
	return (
		<Stack direction='row' alignItems='center' spacing={2}>
			<Typography variant='h6'>{title}</Typography>
			<Button variant='contained' color='primary' onClick={onClick}>
				{nameBtn}
			</Button>
		</Stack>
	);
};

export default ButtonAdd;
