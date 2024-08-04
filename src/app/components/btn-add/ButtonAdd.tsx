import { Button, Typography } from '@mui/material';
import React, { Fragment } from 'react';
import './ButtonAdd.scss';

interface IButtonAdd {
	title: string;
	nameBtn: string;
	onClick?: () => void;
}

const ButtonAdd: React.FC<IButtonAdd> = ({ title, nameBtn, onClick }) => {
	return (
		<Fragment>
			<div className='button-add'>
				<Typography variant='h5'>{title}</Typography>
				<Button variant='contained' onClick={onClick}>
					{nameBtn}
				</Button>{' '}
			</div>
		</Fragment>
	);
};

export default ButtonAdd;
