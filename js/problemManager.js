/*jshint esversion: 6 */

class ProblemManager {

    constructor() {

        // Create Model object for calculations
        this.model = new DSS_model();

        // IF localStorage present, load storage, otherwise intialise problem
        if (localStorage.getItem('problemData') != null) {
            this.loadLocal();
        } else {
            // Create and initialise new data objects
            this.initialiseProblem();
        }
    }

    // Create new data object and initialise
    initialiseProblem() {
        // Create empty copy of Problem data object
        this.problem = jQuery.extend(true, {}, Problem);

        this.addAlternative('');
        this.addCategory('');

        // TODO - REMOVE TEST PROBLEM
        // Load test problem with data from DSS OUTSOURCING stylesheet
        this.loadTestProblem();
    }

    // Update problem - perform calculations to generate results
    update() {
        // Pass current problem data object to DSS model for results calculations
        this.model.resultsCalc(this.problem);
    }

    // Force avergaing of Category weights for summary page
    // ONLY to be run ONCE on initial project load
    forceCategoryWeightsCalc() {
        // Only calculate if all weights are zero
        var weightsEmpty = true;
        $.each(this.problem.categories, function(index, category) {
            if (category.Weight > 0) {
                weightsEmpty = false;
            }
        });

        if (weightsEmpty) {
            var aveWeight = (100 / this.problem.categories.length).toFixedNumber(0);
            var extra = 100 - (aveWeight * this.problem.categories.length);
            console.log("AVERAGE WEIGHT: " + aveWeight);
            console.log("AVERAGE extra: " + extra);
            var weights = [];
            // push first weight plus extra
            weights.push(aveWeight + extra);
            // fill rest of weights with aveWeight
            for (var i = 1; i < this.problem.categories.length; i++) {
                weights.push(aveWeight);
            }
            // set category.weight
            // Loop through all CATEGORIES
            $.each(this.problem.categories, function(index, category) {
                category.Weight = weights[index];
            });
        }
    }

    // Add alternative
    addAlternative(name) {
        this.problem.alternatives.push(name);
        // ADD A WEIGHT TO EACH CRITERION OF EACH CATEGORY
        this.problem.categories.forEach((category) => {
            category.criteria.forEach((criterion) => {
                criterion.alternativeWeights.push(0);
            });
        });
    }
    // Remove last alternative
    removeAlternative() {
        this.problem.alternatives.pop();
        // REMOVE LAST WEIGHT FROM EACH CRITERION OF EACH CATEGORY
        this.problem.categories.forEach((category) => {
            category.criteria.forEach((criterion) => {
                criterion.alternativeWeights.pop();
            });
        });
    }
    // Return length of Alternatives array
    getAltLength() {
        return this.problem.alternatives.length;
    }

    // Add category
    addCategory(name) {
        // DEEP COPY Category to avoid referencing issues
        var newCategory = jQuery.extend(true, {}, Category);
        newCategory.name = name;
        // Add single criterion
        this.addCriterionTo(newCategory, '');
        this.problem.categories.push(newCategory);
    }
    // Remove last category
    removeCategory() {
        this.problem.categories.pop();
    }
    // Return length of Categories array
    getCategoryLength() {
        console.log(this.problem);
        return this.problem.categories.length;
    }
    // Return category of ID
    getCategory(id) {
        return this.problem.categories[id];
    }

    // Add Criterion to category
    addCriterionTo(category, name) {
        // Create new criterion
        // DEEP COPY Criterion to avoid referencing issues
        var newCriterion = jQuery.extend(true, {}, Criterion);
        newCriterion.name = name;
        // init criterion weight to 0
        newCriterion.weight = 0;
        // init alternativeWeights count to number of Alternatives + set to 0
        newCriterion.alternativeWeights.length = this.getAltLength();
        // (NOTE cannot use forEach as setting length does not initialise array elements)
        for (var i = 0; i < newCriterion.alternativeWeights.length; i++) {
            newCriterion.alternativeWeights[i] = 0;
        }
        category.criteria.push(newCriterion);
    }
    // Remove last criteria from category
    removeCriterionFrom(category) {
        category.criteria.pop();
    }

    // SAVE FUNCTIONS

    // Save problem data object to local storage (as JSON)
    saveLocal() {
        localStorage.setObject('problemData', this.problem);
    }

    // IF data stored - Load problem data object from local storage (convert from JSON)
    loadLocal() {
        this.problem = localStorage.getObject('problemData');
    }

    // Clear local Storage
    clearLocal() {
        localStorage.clear();
        sessionStorage.clear();
    }

    // Reset project and clear all current data from memory and local Storage
    resetProject() {
        this.initialiseProblem();
        this.clearLocal();
    }

    // HELPER FUNCTIONS

    // Return sum of array -
    // Call using - ARRAY_TO_BE_SUMMED.reduce(this.getSum); OR ARRAY_TO_BE_SUMMED.reduce(_this.getSum); from within anonymous function
    getSum(total, num) {
        return total + num;
    }

    ////////////////// TESTING //////////////////////
    // load test problem
    loadTestProblem() {
        // DEEP COPY Problem to avoid referencing issues
        this.problem = jQuery.extend(true, {}, Problem);
        this.problem.title = "Test Problem"

        this.addAlternative('Supplier A');
        this.addAlternative('Supplier B');
        this.addAlternative('Supplier C');

        this.addCategory('Financial');
        var category = this.problem.categories[0];
        var tmpCriteria = category.criteria[0];
        tmpCriteria.name = "Criteria 1A"
        tmpCriteria.weight = 30;
        tmpCriteria.alternativeWeights = [80, 0, 0];
        this.addCriterionTo(category, "Criteria 1B");
        tmpCriteria = category.criteria[1];
        tmpCriteria.weight = 40;
        tmpCriteria.alternativeWeights = [60, 20, 20];
        this.addCriterionTo(category, "Criteria 1C");
        tmpCriteria = category.criteria[2];
        tmpCriteria.weight = 10;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(category, "Criteria 1D");
        tmpCriteria = category.criteria[3];
        tmpCriteria.weight = 20;
        tmpCriteria.alternativeWeights = [40, 20, 30];
        category.Weight = 15;


        this.addCategory('Operational');
        category = this.problem.categories[1];
        tmpCriteria = category.criteria[0];
        tmpCriteria.name = "Criteria 2A"
        tmpCriteria.weight = 100;
        tmpCriteria.alternativeWeights = [0, 0, 100];
        this.addCriterionTo(category, "Criteria 2B");
        tmpCriteria = category.criteria[1];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(category, "Criteria 2C");
        tmpCriteria = category.criteria[2];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(category, "Criteria 2D");
        tmpCriteria = category.criteria[3];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [60, 40, 0];
        category.Weight = 30;

        this.addCategory('Strategic Benefit');
        var category = this.problem.categories[2];
        var tmpCriteria = category.criteria[0];
        tmpCriteria.name = "Criteria 1A"
        tmpCriteria.weight = 50;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(category, "Criteria 1B");
        tmpCriteria = category.criteria[1];
        tmpCriteria.weight = 20;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(category, "Criteria 1C");
        tmpCriteria = category.criteria[2];
        tmpCriteria.weight = 20;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(category, "Criteria 1D");
        tmpCriteria = category.criteria[3];
        tmpCriteria.weight = 10;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        category.Weight = 20;

        this.addCategory('Technical');
        var category = this.problem.categories[3];
        var tmpCriteria = category.criteria[0];
        tmpCriteria.name = "Criteria 1A"
        tmpCriteria.weight = 100;
        tmpCriteria.alternativeWeights = [50, 30, 0];
        this.addCriterionTo(category, "Criteria 1B");
        tmpCriteria = category.criteria[1];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [0, 0, 0];
        this.addCriterionTo(category, "Criteria 1C");
        tmpCriteria = category.criteria[2];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [0, 0, 0];
        this.addCriterionTo(category, "Criteria 1D");
        tmpCriteria = category.criteria[3];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [0, 0, 0];
        category.Weight = 10;

        this.addCategory('Risk');
        var category = this.problem.categories[4];
        var tmpCriteria = category.criteria[0];
        tmpCriteria.name = "Criteria 1A"
        tmpCriteria.weight = 10;
        tmpCriteria.alternativeWeights = [60, 20, 0];
        this.addCriterionTo(category, "Criteria 1B");
        tmpCriteria = category.criteria[1];
        tmpCriteria.weight = 20;
        tmpCriteria.alternativeWeights = [60, 0, 40];
        this.addCriterionTo(category, "Criteria 1C");
        tmpCriteria = category.criteria[2];
        tmpCriteria.weight = 30;
        tmpCriteria.alternativeWeights = [50, 50, 0];
        this.addCriterionTo(category, "Criteria 1D");
        tmpCriteria = category.criteria[3];
        tmpCriteria.weight = 40;
        tmpCriteria.alternativeWeights = [40, 30, 30];
        category.Weight = 25;

        // Force update for TESTING
        this.update();
    }

}
