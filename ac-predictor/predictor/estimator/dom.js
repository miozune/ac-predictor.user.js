var estimator_state = 0;
$("#estimator-input").keyup(function () {
	var input = $("#estimator-input").val();
	if (!isFinite(input)) {
		displayAlert("数字ではありません")
		return;
	}
	var history = SideMenu.Predictor.historyObj.filter(x => x.IsRated)
	history.sort(function (a, b) {
		if (a.EndTime < b.EndTime) return 1;
		if (a.EndTime > b.EndTime) return -1;
		return 0;
	})
	history = history.map(x => x.InnerPerformance)
	var input = parseInt(input, 10)
	var res = -1;
	if (estimator_state === 0) {
		// binary search
		var goal_rating = unpositivize_rating(input)
		var lo = -10000.0;
		var hi = 10000.0;
		for (var i = 0; i < 100; ++i) {
			var mid = (hi + lo) / 2;
			var r = calc_rating([mid].concat(history));
			if (r >= goal_rating) {
				hi = mid;
			} else {
				lo = mid;
			}
		}
		res = (hi + lo) / 2;
	}
	else {
		res = calc_rating([input].concat(history));
	}
	res = Math.round(res * 100) / 100
	$("#estimator-res").val(res)
	updateTweetBtn()
});

$("#estimator-toggle").click(function () {
	if (estimator_state === 0) {
		$("#estimator-input-desc").text("パフォーマンス")
		$("#estimator-res-desc").text("到達レーティング")
		estimator_state = 1;
	}
	else {
		$("#estimator-input-desc").text("目標レーティング")
		$("#estimator-res-desc").text("必要パフォーマンス")
		estimator_state = 0;
	}
	var val = $("#estimator-res").val();
	$("#estimator-res").val($("#estimator-input").val())
	$("#estimator-input").val(val)
	updateTweetBtn()
})

function updateTweetBtn() {
	var tweetStr = 
`AtCoderのハンドルネーム: ${userScreenName}%0A
${estimator_state == 0 ? "目標レーティング" : "パフォーマンス"}: ${$("#estimator-input").val()}%0A
${estimator_state == 0 ? "必要パフォーマンス" : "到達レーティング"}: ${$("#estimator-res").val()}`
	$('#estimator-tweet').attr("href", `https://twitter.com/intent/tweet?text=${tweetStr}`)
}

function displayAlert (message) {
	var alertDiv =  document.createElement('div')
	alertDiv.setAttribute("role", "alert")
	alertDiv.setAttribute("class", "alert alert-warning alert-dismissible")
		var closeButton = document.createElement('button')
		closeButton.setAttribute("type", "button")
		closeButton.setAttribute("class", "close")
		closeButton.setAttribute("data-dismiss", "alert")
		closeButton.setAttribute("aria-label", "閉じる")
			var closeSpan = document.createElement('span')
			closeSpan.setAttribute("aria-hidden", "true")
			closeSpan.textContent = "×"
		closeButton.appendChild(closeSpan)
		var	messageContent = document.createTextNode(message)
	alertDiv.appendChild(closeButton)
	alertDiv.appendChild(messageContent)
	$("#estimator-alert").append(alertDiv)
}