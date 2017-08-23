import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { getSuccessPaymentData } from './../actions/robokassaActions.js';

class SuccessPaymentRoute extends Component {
	/*
	 * redirectPath: Путь к компоненту, отображающий успех платежа.
	 * successUrl: Путь, на который перенаправляет robokassa, 
	 * после успешного платежа.
	 * getUserDataUrl: Определённый путь в Django приложение для 
	 * получения данных о платеже пользователя.
	 * username: Имя пользователя, для извлечения из его модели
	 * данных о платеже
	 */
	static PropTypes = {
		redirectPath: PropTypes.string.isRequired,
		successUrl: PropTypes.string.isRequired, 
		username: PropTypes.string,
		user_id: PropTypes.string,
		dispatch: PropTypes.func.isRequired,
		getUserDataUrl: PropTypes.string.isRequired,
		onLoad: PropTypes.func
	}

	componentDidMount() {
		const { dispatch, user_id, username, getUserDataUrl, onLoad } = this.props;

		if (onLoad) onLoad();

		const data = {
			username: username,
			user_id: user_id
		};
		dispatch(getSuccessPaymentData(data, getUserDataUrl));
	}

	render() {
		const { successUrl, redirectPath } = this.props;

		return(
			<Route path={successUrl} render={() => (
				<Redirect to={redirectPath}  />
			)} />
		);
	}
}

const mapStateToProps = state => ({});

export default withRouter(connect(mapStateToProps)(SuccessPaymentRoute));
