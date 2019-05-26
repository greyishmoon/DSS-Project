# Changelog - DSS Project
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/0.3.0/)
and this project follows [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

##Terminology
- RA = RISK ANALYSIS TOOL
- DM = DECISION MAKING TOOL

## [0.2.4] - 25-05-2019
### Altered
#### RISK ANALYSIS
- Risk Assessment page
* Changed Risk Levels to monetary values
* Removed Potential cost impact on project table
- Summary page
* added % symbol to Ignorance
* Changed Risk Range for all Areas to monetary values
- Results page
* Added Unassigned Degree of Belief table (figure) for project
* Changed risk range values to monetary values
* Removed Potential Cost On Project table (figure)
#### DECISION MAKING
- Results page
* Altered Distributed Ignorance heading to 'Aggregated Degrees of Belief after distributing the degree of ignorance'
* Altered second line of Aggregated Degrees of Belief after distributing the degree of ignorance body text
* Added extra line of explanatory text after Aggregated Degrees of Belief after distributing the degree of ignorance table

## [0.2.3] - 15-05-2019
### Fixed
#### DECISION MAKING
- Next/Back buttons not updating data model due to bypassing tab click mechanics - updateData() now added
- Line lengths on narrow screens
#### RISK ANALYSIS
- Next/Back buttons not updating data model due to bypassing tab click mechanics - updateData() now added
- Line lengths on narrow screens

### Added
#### DECISION MAKING
- Menu button to header bar
- Data Entry page - Note to indicate green cells are editable
#### RISK ANALYSIS
- Menu button to header bar
- Risk Assessment page - added note explaining 0% column in Aggregated Risk Assessment table
- Risk Characteristics page - Note to indicate green cells are editable

### Altered
#### MENU
- removed 'Outsourcing' from Decision Making Tool heading
#### RISK ANALYSIS
- Moved 'Load Example' section to end of Instruction page, with note at top where to find it

### Removed
#### MENU
- 'Select a tool...' heading

## [0.2.2] - 09-01-2019
### Altered
#### MENU
- Title from DSS Tools Menu to UDecide Tools Menu
### Added
#### MENU
- UDecide logo
#### RISK ANALYSIS
- Header bar - link to other tool
- Back buttons at bottom of pages
#### DECISION MAKING
- Header bar - link to other tool
- Back buttons at bottom of pages

## [0.2.1] - 01-12-2018
### Added
#### RISK ANALYSIS
- Guidance info to instructions page

## [0.2.0] - 29-10-2018
## FINAL DEV VERSION - FOR TESTING
### Added
- all libraries and replaced CDN calls
- RUN DSS TOOLS relative shortcut
- README.txt with instructions to run
- tested locally from zip
### Removed
- misc unused files and images

## [0.1.10] - 27-10-2018
### Added
#### RISK ANALYSIS
- Completed instructions in html

## [0.1.10] - 27-10-2018
### Added
#### RISK ANALYSIS
- PDF report completed
#### DECISION MAKING
- Added header function to PDF

## [0.1.10] - 14-10-2018
### Added
#### RISK ANALYSIS
- PDF report printing function
- first half of report printout

## [0.1.9] - 28-09-2018
### Added
#### INDEX PAGE
- Introduction text
- Author table with contact link
- UoW logo
#### DECISION MAKING
- All instruction text

## [0.1.9] - 20-09-2018
### Added
#### RISK ANALYSIS
- All percentages validated to 0-100 - alerts if not 0-100
- Input validation for weights groups - must total 100
* Risk Characteristics page
* Impact Assessment page
* Risk Assessment page
* Summary page
* Results page

### Fixed
#### DECISION MAKING
- Data Entry page - percentage input validation - now alerts if not 0-100
- Summary page - weights percentage input validation - now alerts if not 0-100

## [0.1.8] - 14-08-2018
### Added
- Results page calcs + tables:
* calcProjectMvalues();
* calcProjectK();
* calcProjectMalternatives();
* calcProjectMdashH();
* calcProjectMlH();
* calcProjectBeliefs();
* calcProjectRiskLevels();

## [0.1.8] - 13-08-2018
### Added
- Summary page calcs + tables:
* calcObjectiveMvalues();
* calcObjectiveK();
* calcObjectiveMalternatives();
* calcObjectiveMdashH();
* calcObjectiveMlH();
* calcObjectiveBeliefs();
* calcObjectiveRiskLevels();

## [0.1.8] - 12-08-2018
### Added
- Risk assessment calcs:
* calcAggregatedMvalues();
* calcAggregatedK();
* calcAggregatedMalternatives();
* calcAggregatedMdashH();
* calcAggregatedMlH();
* calcAggregatedBeliefs();
* calcAggregatedIgnorance();
* calcRiskLevels();

## [0.1.8] - 07-08-2018
### Added
- Calculations:
* calcMvalues()
* calcK()
* calcMalternatives()
* calcMdashH()
* calcMlH()
* calcBeliefs()
- on Risk assessment tab
* Category groups for tables
* Aggregated Risk Assessment table
* Unassigned Degrees of Belief table

## [0.1.8] - 07-08-2018
### Added
- Risk assessment tab
- Risk assessment tables
- calcs for probability, zeroAssessment + 3 parameter Assessments

## [0.1.7] - 06-08-2018
### Fixed
#### DECISION MAKING
- K calculation - changed from hard coded 2 to alternativeCount-1
- Changed # of Alternatives on reset from 1 to 2
- Limited # of Alternates between 2 and 5 inclusive
- K calculation to scale with number of alternatives
* which also fixed empty problem results errors
- Moved 'Load Example' button to instructions page
- Altered heading text on data entry page (Categories of Criteria)
- Added date line to report
- Altered margin widths on report

## [0.1.6] - 30-07-2018
### Altered
- reformatted colours on data entry tables
- DM - Altered save file name
- DM - refactored save/load, title naming
### Added
- (RISK ANALYSIS TOOL - RA)
- Impact assessment tables
* Grades of Impact table
* Degrees of Belief table
- Save/Load buttons
- Reset project functionality
- Load example project functionality
- Example project based on spreadsheet (in projectManager)
- Save to file
- Load from file


## [0.1.5] - 26-07-2018
### Added
- Scroll up on next buttons and tab clicks on decision making page
- (RISK ANALYSIS TOOL)
- Problem data object definition and creation
- Problem setup page
- Ractive link
- Risk categories table
* Add / remove buttons
* Buttons limited to 1-6 categories
- Next page buttons
* With scroll up function
- Risk Characteristics tables
- Limited # of Categories to 6
- Limited # of Risks to 6

## [0.1.4] - 01-07-2018
### Added
- PDF print to file
* Saved in browser downloads folder
### Fixed
- Inconsistencies with add/remove buttons enabling/disabling
- Set first criterion weight to 100 to avoid validation problems

## [Unreleased] - 11-06-2018
### Added
- Save functionality
* Saved as .json file type
* Saved in browser downloads folder
- Load functionality
* Validation of json file - rejected if not
* Validation of correct project type - rejected if not

## [0.1.3] - 11-06-2018
### Added
- Data entry validation on Data Entry page
* criteria weights and category weights checked for viable totals
* Cells coloured red on problem groups
* Modal dialogue and page redirection pack to problem page is unresolved problems
- As above for aggregated weights on Summary page

## [Unreleased] - 08-06-2018
### Added
- force aggregated weights on Summary page to reset to equal values if number of Categories changed
### Altered
- forceCategoryWeightsCalc() - distributed extra evenly over initial weights

## [Unreleased] - 06-06-2018
### Added
- Extra summary tab
* Moved Analysis Summary and Assessment Aggregation to Summary tab
* Added 'Next' button to progress to Results tab
- Percent Ractive helper function
* Altered all display only cells to convert direct from calcs to percentages
* (could not dual binding working, so input cells still left to store % and be converted in model calcs)
### Removed
- All stored percentage results value from problem.js data structure
* Removed all associated calcs from model

## [Unreleased] - 05-06-2018
### Fixed
- Ractive numbers being saved as strings in
* Criteria tables
* Factors weighting table
- Analysis Summary table not updating on tab change
- Changed all references to FACTORS to CATEGORIES
- Remove Criteria button not removing a criteria
### Added
- 'Next' button to progress to next tab
- Fix to detect corrupt data in localStorage (artefact of renaming factors)
* clear and reload test data set if detected

## [Unreleased] - 03-06-2018
### Added
- localStorage save/reload

## [Unreleased] - 29-05-2018
### Added
- Results page
- Algorithms for Aggregation calculations:
* calcAggregatedMvalues
* calcAggregatedK
* calcAggregatedMalternatives
* calcAggregatedMdashH
* calcAggregatedBeliefs
* calcAggregatedIgnorance

## [Unreleased] - 28-05-2018
### Added
- DSS_model - for calculation algorithms
- Algorithms for DSS calculations:
* calcMvalues
* calcK
* calcMdashH
* calcMlH
* calcBeliefs
* calcIgnorance

## [Unreleased] - 19-03-2018
### Added
- Data entry page
- Criteria data entry pages

## [Unreleased] - 17-03-2018
### Changed
- Data model refactored and expanded

## [Unreleased] - 12-03-2018
### Added
- Ractive integration
- Data model template
- Ractive templates for
* Title
* Alternatives
* Factors


## [Unreleased] - 05-03-2018
### Added
- Data entry page
- Criteria tables

## [Unreleased] - 04-03-2018
### Added
- Decision Making page layout
- Problem Setup page

## [Unreleased] - 03-03-2018
### Added
- Initial framework
- Menu structure
- MDL integration





## [1.0.0] - 2017-06-20
### Added
- EXAMPLE
- EXAMPLE
