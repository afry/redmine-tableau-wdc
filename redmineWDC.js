(function () {
    var myConnector = tableau.makeConnector();
	
	// Init function for connector, called during every phase
//	myConnector.init = function(initCallback) {
//		tableau.authType = tableau.authTypeEnum.basic;

//		if (tableau.phase === tableau.phaseEnum.interactivePhase) {

//			tableau.connectionName = "Redmine Feed";
//			tableau.connectionData = $('input[name="connectionData"]').val();
//			tableau.username = $('input[name="username"]').val();
//			tableau.password = $('input[type="password"]').val();
//			tableau.submit();
//		}
//		initCallback();
//		if (tableau.phase === tableau.phaseEnum.interactivePhase) {
			// Listen for form submission, grab values, and register them with Tableau.
//			$('form').submit(function() {
//				tableau.username = $('input[name="username"]').val();
//				tableau.password = $('input[type="password"]').val();
//				tableau.submit();
//			});
//		}

//	}
	
    myConnector.getSchema = function (schemaCallback) {
		tableau.log("Hello "+tableau.username+"! Welcome to Redmine WDC!");
		var cols = [{
			id: "id",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "subject",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "project",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "issuetype",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "status",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "priority",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "author",
			dataType: tableau.dataTypeEnum.string
		}];

		var tableSchema = {
			id: "redmineFeed",
			alias: "Issues with state not closed",
			columns: cols
		};

		schemaCallback([tableSchema]);
	};

	myConnector.getData = function(table, doneCallback) {
		var offset=0;
		var total=101;
		var tableData = [];
		do {
			( function( captured_total ) {
			$.ajax({dataType: "json",
				type: "GET",
				// Get all issues status_id=*
				url: "http://" + tableau.connectionData + "/issues.json?status_id=*&limit=100&offset=" + offset,
				async: false,
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
					xhr.setRequestHeader('Authorization', "Basic " + btoa(tableau.username+":"+tableau.password));
				},
				success: function(resp) {
					var feat = resp.issues;
					// Iterate over the JSON object
					for (var i = 0, len = feat.length; i < len; i++) {
						tableData.push({
							"id": feat[i].id,
							"subject": feat[i].subject,
							"project": feat[i].project.name,
							"issuetype": feat[i].tracker.name,
							"status": feat[i].status.name,
							"priority": feat[i].priority.name,
							"author": feat[i].author.name
						});
					}
					total = resp.total_count;
					offset = offset + 100;
					table.appendRows(tableData);
				}
			});
		} ( total ) ); 
		} while (offset < total);
		doneCallback();
	};

    tableau.registerConnector(myConnector);
//	tableau.submit();
	
	$(document).ready(function () {
		$("#submitButton").click(function () {
			tableau.connectionName = "Redmine Feed";
			tableau.connectionData = document.getElementById("connectionData").value;
			tableau.username = document.getElementById("username").value;
			tableau.password = $('input[type="password"]').val();
			tableau.submit();
		});
	});
})();