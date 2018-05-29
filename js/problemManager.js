/*jshint esversion: 6 */

class ProblemManager {

    constructor(title) {
        // TODO Check for current problem in memory
        if (false) {
            // TODO If present load problem from memory
        } else {
            // Create and initialise new data objects
            this.initialiseProblem();
        }
        // Create Model object for calculations
        this.model = new DSS_model();

    }

    // Create new data object and initialise
    initialiseProblem() {
        this.problem = new Problem('');
        this.addAlternative('');
        this.addFactor('');
        // Create Model object for calculations
        this.model = new DSS_model();

        // TODO - REMOVE TEST PROBLEM
        // Load test problem with data from DSS OUTSOURCING stylesheet
        this.loadTestProblem();
    }

    // Update problem - perform calculations to generate results
    update() {
        // Pass current problem data object to DSS model for results calculations
        this.model.resultsCalc(this.problem);

    }

    // Add alternative
    addAlternative(name) {
        this.problem.alternatives.push(name);
        // ADD A WEIGHT TO EACH CRITERION OF EACH FACTOR
        this.problem.factors.forEach((factor) => {
            factor.criteria.forEach((criterion) => {
                criterion.alternativeWeights.push(0);
            });
        });
    }
    // Remove last alternative
    removeAlternative() {
        this.problem.alternatives.pop();
        // REMOVE LAST WEIGHT FROM EACH CRITERION OF EACH FACTOR
        this.problem.factors.forEach((factor) => {
            factor.criteria.forEach((criterion) => {
                criterion.alternativeWeights.pop();
            });
        });
    }
    // Return length of Alternatives array
    getAltLength() {
        return this.problem.alternatives.length;
    }

    // Add factor
    addFactor(name) {
        var newFactor = new Factor(name);
        // Add single criterion
        this.addCriterionTo(newFactor, '');
        this.problem.factors.push(newFactor);
    }
    // Remove last factor
    removeFactor() {
        this.problem.factors.pop();
    }
    // Return length of Factors array
    getFactorLength() {
        return this.problem.factors.length;
    }
    // Return factor of ID
    getFactor(id) {
        return this.problem.factors[id];
    }

    // Add Criterion to factor
    addCriterionTo(factor, name) {
        // Create new criterion
        var newCriterion = new Criterion(name);
        // init criterion weight to 0
        newCriterion.weight = 0;
        // init alternativeWeights count to number of Alternatives + set to 0
        newCriterion.alternativeWeights.length = this.getAltLength();
        // (NOTE cannot use forEach as setting length does not initialise array elements)
        for (var i = 0; i < newCriterion.alternativeWeights.length; i++) {
            newCriterion.alternativeWeights[i] = 0;
        }
        factor.criteria.push(newCriterion);
    }
    // Remove last criteria from factor
    removeCriterionFrom(factor) {
        factor.criteria.pop();
    }

    ////////////////// TESTING //////////////////////
    // load test problem
    loadTestProblem() {
        var testProblem = new Problem('Test Problem');
        this.problem = testProblem;
        this.addAlternative('Supplier A');
        this.addAlternative('Supplier B');
        this.addAlternative('Supplier C');

        this.addFactor('Financial');
        var factor = this.problem.factors[0];
        var tmpCriteria = factor.criteria[0];
        tmpCriteria.name = "Criteria 1A"
        tmpCriteria.weight = 30;
        tmpCriteria.alternativeWeights = [80, 0, 0];
        this.addCriterionTo(factor, "Criteria 1B");
        tmpCriteria = factor.criteria[1];
        tmpCriteria.weight = 40;
        tmpCriteria.alternativeWeights = [60, 20, 20];
        this.addCriterionTo(factor, "Criteria 1C");
        tmpCriteria = factor.criteria[2];
        tmpCriteria.weight = 10;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(factor, "Criteria 1D");
        tmpCriteria = factor.criteria[3];
        tmpCriteria.weight = 20;
        tmpCriteria.alternativeWeights = [40, 20, 30];


        this.addFactor('Operational');
        factor = this.problem.factors[1];
        tmpCriteria = factor.criteria[0];
        tmpCriteria.name = "Criteria 2A"
        tmpCriteria.weight = 100;
        tmpCriteria.alternativeWeights = [0, 0, 100];
        this.addCriterionTo(factor, "Criteria 2B");
        tmpCriteria = factor.criteria[1];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(factor, "Criteria 2C");
        tmpCriteria = factor.criteria[2];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [100, 0, 0];
        this.addCriterionTo(factor, "Criteria 2D");
        tmpCriteria = factor.criteria[3];
        tmpCriteria.weight = 0;
        tmpCriteria.alternativeWeights = [60, 40, 0];

        // Force update for TESTING
        this.update();
    }

}
