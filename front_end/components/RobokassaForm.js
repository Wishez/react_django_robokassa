import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Button } from 'semantic-ui-react';
import RenderController from './RenderController';

const RobokassaForm = ({
	submitReplanishBalance,
	handleSubmit,
	robokassaMessage,
	isRedirecting,
	onChangeReplanishCost
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
			placeholder='Количество кредитов'
			onChange={onChangeReplanishCost}
			maxLength='17'
			id='replanishBalanceInput'
		 />
		{robokassaMessage ? 
			<strong className='formError'>{robokassaMessage}</strong> : ''}
		<br />
	 	<Button loading={isRedirecting}
	 		content='Пополнить'
	 		className='replanishBalanceForm__button submit' 
	 	/>	
	 </form>
);


export default reduxForm({
	form: 'robokassaForm'
})(RobokassaForm);
 
