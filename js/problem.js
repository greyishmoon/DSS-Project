class Problem {
    constructor(title) {
        this.title = title;
        this.alternatives = [];
        this.factors = [];

        // Initialisation
        this.addAlternative('INIT ALT');
        this.addFactor('INIT FACT');
    }

    // Add alternative
    addAlternative(name) {
        this.alternatives.push(name);
        // TODO ADD A WEIGHT TO EACH CRITERION OF EACH FACTOR
    }
    // Remove last alternative
    removeAlternative() {
        this.alternatives.pop();
        // TODO REMOVE LAST WEIGHT FROM EACH CRITERION OF EACH FACTOR
    }

    // Add factor
    addFactor(name) {
        console.log("ADD FACTOR");
        console.log("# Alts: " + this.alternatives.length);
        var newFactor = new Factor(name);
        // TODO - ADD SINGLE CRITERION
        newFactor.criteria.push(new Criterion('init criteria'));
        // Fill criteria weights to cater for number of ALTERNATIVES
        for (var i = 0; i < this.alternatives.length; i++) {
            console.log("ADD CRITERION");
            newFactor.criteria[0].alternativeWeights.push(0);
        }
        this.factors.push(newFactor);
    }
    // Remove last factor
    removeFactor() {
        this.factors.pop();
    }

    // Add Criterion to factor in position 'factorNum' in factors array
    // 'factorNum' index of factor to add Criterion too - index from 0
    addCriterion(factorNum, name) {
        console.log("CRITERION ADD");
        var newCriterion = new Criterion(name);
        // TODO - ADD NUMBER OF WEIGHTS TO CRTERION EQUAL TO NUMBER OF ALTERNATIVES
        this.factors[factorNum].push(newCriterion);
    }
    // Remove last criteria from 'factorNum' in factors array
    removeCriterion(factorNum) {
        this.factors[factorNum].criteria.pop();
    }
}

class Factor {
    constructor(name) {
        this.name = name;
        this.criteria = [];
    }
}

class Criterion {
    constructor(name) {
        this.name = name;
        this.weight = 0;
        this.alternativeWeights = [];
    }
}

//var project = new Project();
