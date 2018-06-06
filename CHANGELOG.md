# Changelog - DSS Project
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/0.3.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).


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
