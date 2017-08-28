import React from 'react';
import { Field, reduxForm } from 'redux-form';
import RenderController from './RenderController';

const RobokassaForm = ({
	submitReplanishBalance,
	handleSubmit,
	robokassaMessage,
	onChangeReplanishCost,
	isRedirecting
}) => (
	<form id='replanishBalanceForm'
		onSubmit={handleSubmit(submitReplanishBalance.bind(this))}
		className='replanishBalanceForm'>
		<Field component={RenderController}
			name='OutSum'
			type='number'
			min='1'
			max='1000000'
			block='replanishBalanceFormController'
			placeholder='Сумма'
			onChange={onChangeReplanishCost}
			maxLength='17'
			id='replanishBalanceInput'
		 />
		{robokassaMessage ? 
			<strong className='formError'>{robokassaMessage}</strong> : ''}
		<br />
	 	<button className='replanishBalanceForm__button submit'>
	 		Пополнить
	 	<button/>	
	 </form>
);


export default reduxForm({
	form: 'robokassaForm'
})(RobokassaForm);
 
