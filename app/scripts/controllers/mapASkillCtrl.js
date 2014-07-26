'use strict';
skillsModule.controller('mapASkillCtrl', [
	'$scope',
	'$filter',
	'$http',
	'dataFactory',
	'formatFactory',
	function ($scope, $filter, $http, dataFactory, formatFactory) {
		$scope.filteredPeople = [];
		$scope.filteredSkills = [];
		$scope.addPersonList = [];
		$scope.addSkillList = [];
		$scope.currentPagePeople = 1;
		$scope.currentPageSkills = 1;
		$scope.maxPages = 5;
		$scope.urlBase = 'http://lasp-db-dev:3030/VIVO/query';
		$scope.UFurlBase = 'http://sparql.vivo.ufl.edu/VIVO/query';
		$scope.LASPpersonnelLocation = 'cached_json/LASP_personnel.json';
		$scope.LASPskillsLocation = 'cached_json/LASP_skills.json';
		function getPersonnel() {
		    $scope.personQueryStr = 'PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#> PREFIX foaf: <http://xmlns.com/foaf/0.1/> SELECT ?person ?personuri WHERE{ ?personuri a foaf:Person . ?personuri rdfs:label ?person}';
			$scope.UFpersonQueryStr = 'PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX ufVivo: <http://vivo.ufl.edu/ontology/vivo-ufl/> SELECT ?person ?personuri WHERE{ ?personuri ufVivo:homeDept <http://vivo.ufl.edu/individual/n391868> . ?personuri a foaf:Person . ?personuri rdfs:label ?person}';
			// Get UF's real vivo people
		    dataFactory.getSPARQLQuery($scope.UFurlBase, $scope.UFpersonQueryStr).success(function (data) {
				$scope.error = '';
				// If we got UF's real vivo output, get LASP's cached people
				if (data) {
				    $scope.peoplelist = data;
				    for ( var i = 0; i < $scope.peoplelist.results.bindings.length; i++ ) {
				        $scope.peoplelist.results.bindings[i].person.value = $scope.peoplelist.results.bindings[i].person.value + " (UF)"
				    }
				    dataFactory.getCachedJSON( $scope.LASPpersonnelLocation ).success(function (data) {
				        for ( var i = 0; i < data.results.bindings.length; i++ ) {
	                        data.results.bindings[i].person.value = data.results.bindings[i].person.value + " (LASP)"
	                    }
				        $scope.peoplelist.results.bindings = $scope.peoplelist.results.bindings.concat( data.results.bindings );
				        $scope.peoplelist = formatFactory.formatPersonnelList( $scope.peoplelist );
	                    $scope.filterPeople();
				    });
				}
			}).error(function (data, status) {
				$scope.error = 'Fuseki person query returned: ' + status;
			});
		}
		function getSkills() {
			/*
			$scope.skillQueryStr = 'PREFIX laspcms: <http://localhost:8080/laspcms#> PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#> PREFIX laspskills: <http://webdev1.lasp.colorado.edu:57529/laspskills#> SELECT ?skill ?skilllevel ?skillleveluri WHERE{?skillleveluri a laspskills:SkillLevel . ?skillleveluri laspskills:levelForSkill ?skilluri . OPTIONAL{?skillleveluri laspcms:uniqueScoreID ?scoreid} . ?skilluri rdfs:label ?skill . ?skillleveluri rdfs:label ?skilllevel} ORDER BY asc(?skill) asc(?scoreid)';
			dataFactory.getSPARQLQuery($scope.urlBase, $scope.skillQueryStr).success(function (data) {
				$scope.error = '';
				if (data) {
					$scope.skilllist = formatFactory.formatSkillList(data);
					$scope.filterSkills();
				}
			}).error(function (data, status) {
				$scope.error = 'Fuseki skill query returned: ' + status;
			});*/
			dataFactory.getCachedJSON( $scope.LASPskillsLocation ).success(function (data) {
				$scope.error = '';
				if (data) {
					$scope.skilllist = formatFactory.formatSkillList( data );
					$scope.filterSkills();
				}
			}).error(function ( data, status ) {
				$scope.error = 'Fuseki skill query returned: ' + status;
			});
		}
		//Call initialization functions
		getPersonnel();
		getSkills();
		
		//function to remove the skill names from the skill level drop down options
		$scope.skillLevelDisplay = function (skill, skillLevel) {
			return skillLevel.replace(skill, '');
		};
		$scope.filterSkills = function () {
			$scope.filteredSkills = $filter('QuickSearch')($scope.skilllist, $scope.skillquery, 'skill');
			//groupToPages() does not filter input
			$scope.pagedSkills = $scope.groupToPages($scope.filteredSkills);
			return $scope.filteredSkills;
		};
		$scope.filterPeople = function () {
			$scope.filteredPeople = $filter('QuickSearch')($scope.peoplelist, $scope.personquery, 'person');
			//groupToPages() does not filter input
			$scope.pagedPeople = $scope.groupToPages($scope.filteredPeople);
			return $scope.filteredPeople;
		};
		//function to run when the submit button is pressed
		$scope.SubmitButtonPressed = function () {
			if ($scope.addPersonList.length < 1) {
				alert('Please select at least one person.');
				return;
			}
			if ($scope.addSkillList.length < 1) {
				alert('Please select at least one skill.');
				return;
			}
			//$scope.SubmitText = 'personuri,leveluri,skill\n';
			$scope.SubmitTextPublic = '';
			$scope.newSkillSubmitText = 'personuri,skillname,level\n';
			var levelSelected = 0;
			var addingNewSkill = false;
			var addingExistingSkill = false;
			for (var i = 0; i < $scope.addPersonList.length; i++) {
				for (var j = 0; j < $scope.addSkillList.length; j++) {
					levelSelected = document.getElementById($scope.addSkillList[j].skill).selectedIndex;
					if ($scope.addSkillList[j].levels[0].skillleveluri === '0') {
						addingNewSkill = true;
						$scope.newSkillSubmitText += $scope.addPersonList[i].uri + ',';
						$scope.newSkillSubmitText += $scope.addSkillList[j].skill + ',';
						$scope.newSkillSubmitText += $scope.addSkillList[j].levels[levelSelected].skillleveluri + '\n';
					} else {
						addingExistingSkill = true;
						$scope.SubmitTextPublic += '{'+
							'"Person": { "type": "literal" , "value": "'+
							$scope.addPersonList[i].person.substring( 0, $scope.addPersonList[i].person.lastIndexOf(' ') )+
							'" } ,'+
					        '"personuri": { "type": "uri" , "value": "http://tmpURI" } ,'+
					        '"Skill": { "type": "literal" , "value": "'+$scope.addSkillList[j].skill+'" } ,'+
					        '"SkillLevel": { "type": "literal" , "value": "'+$scope.addSkillList[j].levels[levelSelected].skilllevel+'" } ,'+
					        '"skillleveluri": { "type": "uri" , "value": "'+$scope.addSkillList[j].levels[levelSelected].skillleveluri+'" } ,'+
					        '"Office": { "type": "literal" , "value": "" } ,'+
					        '"Email": { "type": "literal" , "value": "" } ,'+
					        '"PhoneNumber": { "type": "literal" , "value": "" } ,'+
					        '"Position": { "type": "literal" , "value": "" } ,'+
					        '"Division": { "type": "literal" , "value": "" } ,'+
					        '"Group": { "type": "literal" , "value": "" }'+
					      '} ,';
						/*
						$scope.SubmitText += $scope.addPersonList[i].uri + ',';
						$scope.SubmitText += $scope.addSkillList[j].levels[levelSelected].skillleveluri + ',';
						$scope.SubmitText += $scope.addSkillList[j].skill + '\n';
						$scope.SubmitTextPublic = $scope.SubmitText;
						*/
					}
				}
			}
			$scope.SubmitTextPublic = $scope.SubmitTextPublic.substring( 0, $scope.SubmitTextPublic.length-1 ) + ']';
			if (addingNewSkill) {
				var moveOn = confirm('Warning: You are about to add a new skill to the database that didn\'t exist before.  Only click \'OK\' if you are SURE that this skill (or any alternate way of spelling it) doesn\'t already exist in the database.');
				if (!moveOn) {
					return;
				}
			}
			//display cute working gif even though it doesn't really know anything about anything
			document.getElementById('submitButtonDiv').innerHTML = '<img src="images/loading.gif"/><br>Working... ';
			//actually post the new skill(s), using the corresponding version of the harvester if the skill doesn't already exist
			if (addingNewSkill) {
				ajaxSubmitNewSkillMap();
			}
			if (addingExistingSkill) {
				ajaxSubmitExistingSkillMap();
			}
			
			alert('New skill mapping added!');
			location.reload();
			/*
			//wait 5 seconds and then display a success message (yes, this is a lie since the skill may or may not have actually been added by now)
			setTimeout(function () {
				document.getElementById('submitButtonDiv').innerHTML = 'Done. ';
			}, 5000);
			setTimeout(function () {
				alert('New skill mapping added!');
				location.reload();
			}, 5000);
			*/
		};
		function ajaxSubmitNewSkillMap() {
			$.ajax({
				type: 'POST',
				url: 'scripts/button_actions/submitButtonActionNewSkill.php',
				data: { SubmitText: $scope.newSkillSubmitText }
			});
		}
		/*function ajaxSubmitExistingSkillMap() {
			$.ajax({
				type: 'POST',
				url: 'scripts/button_actions/submitButtonAction.php',
				data: { SubmitText: $scope.SubmitText }
			});
		}*/
		function ajaxSubmitExistingSkillMap() {
            $.ajax({
                type: 'POST',
                url: 'scripts/button_actions/submit_button_action_public.php',
                data: { SubmitTextPublic: $scope.SubmitTextPublic }
            });
		}
		//Add and Remove Button Functions
		$scope.removeFromAddPerson = function (index) {
			$scope.peoplelist.push($scope.addPersonList[index]);
			$scope.addPersonList.splice(index, 1);
			$scope.filterPeople();
		};
		$scope.addToPeople = function (person) {
			var actualIndex = $scope.peoplelist.indexOf(person);
			$scope.addPersonList.push($scope.peoplelist[actualIndex]);
			$scope.peoplelist.splice(actualIndex, 1);
			$scope.filterPeople();
		};
		$scope.removeFromAddSkill = function (index) {
			$scope.skilllist.push($scope.addSkillList[index]);
			$scope.addSkillList.splice(index, 1);
			$scope.filterSkills();
		};
		$scope.addToSkills = function (skill) {
			var actualIndex = $scope.skilllist.indexOf(skill);
			$scope.addSkillList.push($scope.skilllist[actualIndex]);
			$scope.skilllist.splice(actualIndex, 1);
			$scope.filterSkills();
		};
		$scope.addNewSkill = function (skill) {
			alert(skill + ' will now be shown in the skill list.  Note that it will only be added to the database when you assign it to a person.');
			$scope.skilllist.push({
				'skill': skill,
				'levels': [
					{
						'skilllevel': skill + ' (unranked)',
						'skillleveluri': '0'
					},
					{
						'skilllevel': skill + ' beginner',
						'skillleveluri': '1'
					},
					{
						'skilllevel': skill + ' intermediate',
						'skillleveluri': '2'
					},
					{
						'skilllevel': skill + ' advanced',
						'skillleveluri': '3'
					},
					{
						'skilllevel': skill + ' guru',
						'skillleveluri': '4'
					}
				]
			});
			$scope.searchSkills(skill);
		};
		//search functions
		$scope.searchPeople = function (person) {
			if (person.length > 0) {
				$scope.currentPagePeople = 1;
			}
			return $scope.filterPeople();
		};
		$scope.searchSkills = function (skill) {
			if (skill.length > 0) {
				$scope.currentPageSkills = 1;
			}
			return $scope.filterSkills();
		};
		//Pagination Functions
		$scope.itemsPerPage = 15;
		$scope.maxPages = 5;
		//groupToPages() does not filter input
		$scope.groupToPages = function (list) {
			var pagedList = [];
			for (var i = 0; i < list.length; i++) {
				if (i % $scope.itemsPerPage === 0) {
					pagedList[Math.floor(i / $scope.itemsPerPage)] = [list[i]];
				} else {
					pagedList[Math.floor(i / $scope.itemsPerPage)].push(list[i]);
				}
			}
			return pagedList;
		};
		$scope.countPagedList = function (list) {
			var count = 0;
			if (typeof list === 'undefined') {
				return count;
			}
			for (var i = 0; i < list.length; i++) {
				count += list[i].length;
			}
			return count;
		};
	}
]);