"use strict";

app.factory("ChartFactory", function(AuthFactory){



function getBar(grade){


	var bar = new ProgressBar.SemiCircle(chartDiv, {
		strokeWidth: 6,
		color: '#FFEA82',
		trailColor: '#eee',
		trailWidth: 1,
		easing: 'easeInOut',
		duration: 1400,
		svgStyle: null,
		text: {
		value: '',
		alignToBottom: false
	},
		from: {color: '#FFEA82'},
		to: {color: '#ED6A5A'},
	// Set default step function for all animate calls
	step: (state, bar) => {
		bar.path.setAttribute('stroke', state.color);
		var value = Math.round(bar.value() * 100);
		if (value === 0) {
			bar.setText('');
		} else {
			console.log("VALUE: ", value);
			bar.setText(grade.toFixed(2) + "%");
		}

		bar.text.style.color = state.color;
		}
	});
	bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
	bar.text.style.fontSize = '2rem';


	return bar;

	// bar.animate(1.0);  // Number from 0.0 to 1.0
}

return {getBar};

});