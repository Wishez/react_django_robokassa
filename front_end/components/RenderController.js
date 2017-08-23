import React from 'react';

const RenderController = ({
	input,
	meta: {
		touched,
		error,
		warning
	},
	block,
	...rest
}) => (
	<div className={block}>
		<input {...input}
			{...rest}
			className={block + '__input'} />
		 {touched && 
		 	((error && 
		 		<span className={block + '__error'}>{error}</span>) || 
		 		(warning && <span className={block + '__error'}>{warning}</span>))}
	</div>
);

export default RenderController;