<div class="container-fluid">
	<div id="circle">&nbsp;</div>
		<div class="row-fluid">
			<div>
				<!--Sidebar content-->
				Quick text search:<br>
				<input ng-model="query" placeholder="Search for text" ng-change="searchResults(query)">
			</div>
			<div>
				<!--Body content-->
				<p class="error">{{error}}</p>
				<p ng-hide="skills" style="text-align:center;"> 
					<img src="images/loading.gif"/><br>
					Loading...
				</p>
				<table ng-table class="table" ng-show="skills">
					<th class="columnHeader" ng-class="sortingClass('Person')" ng-click="changeSorting('Person')"> Name </th>
					<th class="columnHeader" ng-class="sortingClass('Skill')" ng-click="changeSorting('Skill')"> Skill </th>
					<th class="columnHeader" ng-class="sortingClass('Office')" ng-click="changeSorting('Office')"> Office </th>
					<th class="columnHeader" ng-class="sortingClass('Email')" ng-click="changeSorting('Email')"> Email </th>
					<th class="columnHeader" ng-class="sortingClass('PhoneNumber')" ng-click="changeSorting('PhoneNumber')"> Phone Number </th>
					<th class="columnHeader" ng-class="sortingClass('Position')" ng-click="changeSorting('Position')"> Position </th>
					<th class="columnHeader" ng-class="sortingClass('Division')" ng-click="changeSorting('Division')"> Division </th>
					<th class="columnHeader" ng-class="sortingClass('Group')" ng-click="changeSorting('Group')"> Group </th>
					<tr ng-repeat="row in pagedResults[currentPageResults-1]">
						<td>
							{{row.Person}}
						</td>
						<td data-title="'Skill'">
							{{row.Skill}}
							<button class="removeButton" ng-click="DeleteButtonPressed(row.Person, row.PersonURI, row.Skill, row.SkillURI, $index)" title="Remove Skill"><img src="images/remove-button.png" width="20px" height="20px"/></button>
						</td>
						<td data-title="'Office'">
							{{row.Office}}
						</td>
						<td data-title="'Email'">
							<a href="mailto:{{row.Email}}">{{row.Email}}</a>
						</td>
						<td data-title="'Phone Number'">
							{{row.PhoneNumber}}
						</td>
						<td data-title="'Position'">
							{{row.Position}}
						</td>
						<td data-title="'Division'">
							{{row.Division}}
						</td>
						<td data-title="'Group'">
							{{row.Group}}
						</td>
					</tr>
				</table>
				<div ng-hide="!skills" class="center">
					<pagination boundary-links="true" total-items="countPagedList(pagedResults)" page="currentPageResults" items-per-page="itemsPerPage" max-size="maxPages" rotate="false"
												class="pagination-small" previous-text="&lsaquo;" next-text="&rsaquo;" first-text="&laquo;" last-text="&raquo;"></pagination>
					<div style="width: 106px" class="btn-group" ng-click="filterResults()">
						<button id="btn-resize-15" type="button" class="btn btn-success" ng-model="itemsPerPage" btn-radio=15>15</button>
						<button id="btn-resize-25" type="button" class="btn btn-success" ng-model="itemsPerPage" btn-radio=25>25</button>
						<button id="btn-resize-50" type="button" class="btn btn-success" ng-model="itemsPerPage" btn-radio=50>50</button>
					</div>
				</div>
				<p ng-hide="!skills">
				Number of Results: {{countPagedList(pagedResults)}}
				</p>
				<br><br>
			</div>
		</div>
	</div>	
</div>