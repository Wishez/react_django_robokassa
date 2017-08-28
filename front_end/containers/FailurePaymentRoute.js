import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { failurePayment } from './../actions/robokassaActions.js';

class FailurePaymentRoute extends Component {
	/*
	 * redirectPath: Путь к компоненту, отображающий успех платежа.
	 * failureUrl: Путь, на который перенаправляет robokassa, 
	 * после не успешного платежа.
	 */
	static PropTypes = {
		redirectPath: PropTypes.string.isRequired,
		failureUrl: PropTypes.string.isRequired, 
		dispatch: PropTypes.func.isRequired,
		onLoad: PropTypes.func,
		failureMessage: PropTypes.string.isRequired
	}

	componentDidMount() {
		const { 
			dispatch,
		 	failureMessage,
		 	onLoad 
		} = this.props;

		if (onLoad) onLoad();

		dispatch(failurePayment(failureMessage));
	}

	render() {
		const { failureUrl, redirectPath } = this.props;

		return(
			<Route path={failureUrl} render={() => (
				<Redirect to={redirectPath}  />
			)} />
		);
	}
}

const mapStateToProps = state => ({});

export default withRouter(connect(mapStateToProps)(FailurePaymentRoute));
