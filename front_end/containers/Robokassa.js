import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import RobokassaForm from './../components/RobokassaForm';
import Title from './../components/Title';
import { moveUserToPaynment } from './../actions/robokassaActions.js';

class Robokassa extends Component {
	static PorpTypes = {
		url: PropTypes.string.isRequired,
		dispatch: PropTypes.func.isRequired,
		InvDesc: PropTypes.string.isRequired,
		Email: PropTypes.string,
		isRedirecting: PropTypes.bool.isRequired,
		robokassaMessage: PropTypes.string.isRequired,
		username: PropTypes.string,
		user_id: PropTypes.number,
	}
	state =  {
		replanishCost: '1 рубль = 1 кредит'
	};

	componentDidMount() {
		

	}

	submitReplanishBalance = (values, dispatch) => {
		const { InvDesc, Email, username, url } = this.props;
		values['InvDesc'] = InvDesc;
		values['InvId'] = 0;
		values['Email'] = Email;
		values['username'] = username;

		dispatch(moveUserToPaynment(values, url));

	}

	onChangeReplanishCost = e => {
		let target = e.target;
		let value = target.value;
		let declinationRubles = '';
		let declinationCredits = '';

		// Выбирается склонение.
		if (+value === 1 || !value) {
			declinationRubles = 'рубль';
			declinationCredits = 'кредит'
			value = 1;
		} else if (value > 1 && value < 5) {
			declinationRubles = 'рубля';
			declinationCredits = 'кредита';
		} else {
			declinationRubles = 'рублей';
			declinationCredits = 'кредитов';
		}

		// Ограничивает длину строки в целочисленном поле.
		if (value && value.length > 20) { 
			// Обновление установленного значения.
			value = value.slice(0, 20);
		};
		// Устанавливается состояние сообщеня. Показывает количество кредитов, 
		// которое получит игрок.
		this.setState({
			replanishCost: `${value} ${declinationRubles} = ${value} ${declinationCredits}`
		});

	}

	render () {
		const { replanishCost } = this.state; 

		return (
			<div className='replanishBalance'>
				<Title block='replanishBalance'
					text='Пополнить баланс' />
				<p className='replanishBlance__description'>
					{replanishCost}
				</p> 
				<RobokassaForm
					submitReplanishBalance={this.submitReplanishBalance} 
					onChangeReplanishCost={this.onChangeReplanishCost}
					{...this.props}/>
			</div>
		);
	}
}


const mapStateToProps = state => {
	const {
		robokassa
	} = state;
	

	const {
		isRedirecting,
		robokassaMessage
	} = robokassa;


	return {
		isRedirecting,
		robokassaMessage
	};
};

export default withRouter(connect(mapStateToProps)(Robokassa));