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
    }

    // Create new data object and initialise
    initialiseProblem() {
        this.problem = new Problem('');
        this.addAlternative('TEST ALT');
        this.addFactor('TEST FACT');
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
        this.addCriterionTo(newFactor, 'TEST CRITERION');
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

}
