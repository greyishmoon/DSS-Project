/*jshint esversion: 6 */

class ProblemManager {

    constructor() {

        // Create Model object for calculations
        this.model = new DSS_DM_model();

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
        // Clear local storage
        this.clearLocal();
        // Create empty copy of Problem data object and set this.project to it
        this.setBlankProblem("BLANK PROBLEM");
        // Save blank project to local storage
        this.saveLocal();

        // Create empty copy of Problem data object
        // this.problem = jQuery.extend(true, {}, Problem);
        // console.log("EMPTY PROJECT IN INITIALISE");
        // console.log(this.problem);
        // this.addCategory('');
        // this.addAlternative('');

    }

    // Create blank problem and set this.problem
    setBlankProblem(problemName) {
        // Create blank project (deep copy clone) and name
        this.problem = null;
        this.problem = jQuery.extend(true, {}, Problem);
        this.problem.name = problemName;
        // Add single category
        this.addCategory('');
        // Add two alternatives
        this.addAlternative('');
        this.addAlternative('');
    }

    // Update problem - perform calculations to generate results
    update() {
        // Pass current problem data object to DSS model for results calculations
        this.model.resultsCalc(this.problem);
    }

    // Force averaging of Category weights for summary page
    // ONLY to be run when number of categories is changed or a empty project is loaded
    forceCategoryWeightsCalc() {
        // Calc average weight
        var aveWeight = Math.floor(100 / this.problem.categories.length);
        // calc remainder
        var extra = 100 % this.problem.categories.length;
        console.log("AVERAGE WEIGHT: " + aveWeight);
        console.log("AVERAGE extra: " + extra);
        var weights = [];
        // Push average weights to weights, add one if any extra remeaining to distibute remainder evenly
        for (var i = 0; i < this.problem.categories.length; i++) {
            if (extra > 0) {
                weights.push(aveWeight + 1);
                extra--;
            } else {
                weights.push(aveWeight);
            }
        }
        // set category.weight
        $.each(this.problem.categories, function(index, category) {
            category.weight = weights[index];
        });

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
        // init category weight
        if (this.problem.categories.length <= 0) {
            // If first category in problem set category weight to 100
            // to avoid immediate validation problems in Assessmnet Aggregation table
            newCategory.weight = 100;
        } else {
            // Otherwise set to zero
            newCategory.weight = 0;
        }
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
        return this.problem.categories.length;
    }
    // Return length of criteria array of Category index number (from zero)
    getCriteriaLength(categoryIndex) {
        return this.problem.categories[categoryIndex].criteria.length;
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
        // set first alternativeWeight
        newCriterion.alternativeWeights[0] = 80;
        // init criterion weight
        if (category.criteria.length <= 0) {
            // If first crierion in category set category weight to 100
            // to avoid immediate validation problems
            newCriterion.weight = 100;
        } else {
            // Otherwise set to zero
            newCriterion.weight = 0;
        }
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
        // check for null categories problem
        if (this.problem.categories == null) {
            // This is incorrectly stored data structure from before factor to category renaming
            // Clear locaStorage and load test problem
            this.clearLocal();
            this.initialiseProblem();
        }
    }

    // Clear local Storage
    clearLocal() {
        localStorage.setObject('problemData', null);

    }

    // Reset project and clear all current data from memory and local Storage
    resetProject() {
        this.initialiseProblem();
    }

    // Load example project
    loadExample() {
        this.clearLocal();
        // this.resetProject();
        // Create empty copy of Problem data object
        this.problem = jQuery.extend(true, {}, Problem);
        this.loadExampleProblem();
    }

    // HELPER FUNCTIONS

    getProblem(){
        return this.problem;
    }

    setProblem(jsObject) {
        //Set current data object to new jsObject
        this.problem = jsObject;
    }

    // Return sum of array -
    // Call using - ARRAY_TO_BE_SUMMED.reduce(this.getSum); OR ARRAY_TO_BE_SUMMED.reduce(_this.getSum); from within anonymous function
    getSum(total, num) {
        return total + num;
    }

    // Check values of aggregated weight total 100 - return TRUE if = 100
    checkAggregatedWeightsOk() {
        var total = 0;
        // Loop over every category
        for (var i = 0; i < this.problem.categories.length; i++) {
            // Sum weights for each category
            total += this.problem.categories[i].weight;
        }
        // return TRUE if total = 100
        return (total === 100) ? true : false;
    }

    // Check values of all criteria weights in a category total 100
    // return array of category indexes where total weight != 100
    checkCategoryWeights() {
        var faultsIndex = [];
        // Loop over each category
        for (var cat = 0; cat < this.problem.categories.length; cat++) {
            // Loop over each criteria
            var total = 0;
            for (var crit = 0; crit < this.problem.categories[cat].criteria.length; crit++) {
                // Sum weights for each category
                total += this.problem.categories[cat].criteria[crit].weight;
            }
            // If total != 100 push category nuber to faultsIndex
            if (total !== 100)
                faultsIndex.push(cat);
        }
        // return collection of failed category indexes
        return faultsIndex;
    }

    // Check values of an array of criteria weights
    // return array of objects {Category: #, criterion: #} of problem criteria rows
    // ARRAY_TO_BE_SUMMED.reduce(this.getSum);
    checkCriteriaWeights() {
        var faultsIndex = [];
        // Loop over each category
        for (var cat = 0; cat < this.problem.categories.length; cat++) {
            // Loop over each criteria
            var total = 0;
            for (var crit = 0; crit < this.problem.categories[cat].criteria.length; crit++) {
                // Sum weights for each category
                var array = this.problem.categories[cat].criteria[crit].alternativeWeights;
                var arraySum = this.problem.categories[cat].criteria[crit].alternativeWeights.reduce(this.getSum);

                // If total > 100 push category nuber to faultsIndex
                if (arraySum > 100)
                    faultsIndex.push({category: cat, criteria: crit});
            }



        }

        // return collection of failed category indexes
        return faultsIndex;
    }

    ////////////////// TESTING //////////////////////
    // load test problem
    loadExampleProblem() {
        // DEEP COPY new Problem to avoid referencing issues
        this.problem = jQuery.extend(true, {}, Problem);
        this.problem.name = "Example Problem";

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
        category.weight = 15;


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
        category.weight = 30;

        this.addCategory('Strategic Benefit');
        var category = this.problem.categories[2];
        var tmpCriteria = category.criteria[0];
        tmpCriteria.name = "Criteria 3A"
        tmpCriteria.weight = 50;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(category, "Criteria 3B");
        tmpCriteria = category.criteria[1];
        tmpCriteria.weight = 20;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(category, "Criteria 3C");
        tmpCriteria = category.criteria[2];
        tmpCriteria.weight = 20;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(category, "Criteria 3D");
        tmpCriteria = category.criteria[3];
        tmpCriteria.weight = 10;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        category.weight = 20;

        this.addCategory('Technical');
        var category = this.problem.categories[3];
        var tmpCriteria = category.criteria[0];
        tmpCriteria.name = "Criteria 4A"
        tmpCriteria.weight = 100;
        tmpCriteria.alternativeWeights = [50, 30, 0];
        this.addCriterionTo(category, "Criteria 4B");
        tmpCriteria = category.criteria[1];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [0, 0, 0];
        this.addCriterionTo(category, "Criteria 4C");
        tmpCriteria = category.criteria[2];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [0, 0, 0];
        this.addCriterionTo(category, "Criteria 4D");
        tmpCriteria = category.criteria[3];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [0, 0, 0];
        category.weight = 10;

        this.addCategory('Risk');
        var category = this.problem.categories[4];
        var tmpCriteria = category.criteria[0];
        tmpCriteria.name = "Criteria 5A"
        tmpCriteria.weight = 10;
        tmpCriteria.alternativeWeights = [60, 20, 0];
        this.addCriterionTo(category, "Criteria 5B");
        tmpCriteria = category.criteria[1];
        tmpCriteria.weight = 20;
        tmpCriteria.alternativeWeights = [60, 0, 40];
        this.addCriterionTo(category, "Criteria 5C");
        tmpCriteria = category.criteria[2];
        tmpCriteria.weight = 30;
        tmpCriteria.alternativeWeights = [50, 50, 0];
        this.addCriterionTo(category, "Criteria 5D");
        tmpCriteria = category.criteria[3];
        tmpCriteria.weight = 40;
        tmpCriteria.alternativeWeights = [40, 30, 30];
        category.weight = 25;

        // Force update for TESTING
        this.update();

        console.log("EXAMPLE PROBLEM");
        console.log(this.problem);
    }

}
