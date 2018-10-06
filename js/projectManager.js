/*jshint esversion: 6 */

class ProjectManager {

    constructor() {

        // Create Model object for calculations
        this.model = new DSS_RA_model();

        // IF localStorage present, load storage, otherwise intialise problem
        if (localStorage.getItem('riskAnalysisData') != null) {
            this.loadLocal();
        } else {
            // Create and initialise new data objects
            this.initialiseProject();
        }
    }

    // Create new data object and initialise
    initialiseProject() {
        // Clear local storage
        this.clearLocal();
        // Create empty copy of Problem data object and set this.project to it
        this.setBlankProject("BLANK PROJECT");
        // Save blank project to local storage
        this.saveLocal();
    }

    // Update problem - perform calculations to generate results
    update() {
        // Pass current problem data object to DSS model for results calculations
        this.model.resultsCalc(this.project);
    }

    // Create blank project and set this.project
    setBlankProject(projectName) {
        // Create blank project (deep copy clone) and name
        this.project = null;
        this.project = JSON.parse(JSON.stringify(Project));
        this.project.name = projectName;
        // Add single category
        // Set 1st category weight to 100 to maintain consistency with entry verification
        this.addCategory("", 100);

    }
    // Return project data object
    getProject() {
        return this.project;
    }
    setProject(jsObject) {
        //Set current data object to new jsObject
        this.project = jsObject;
    }
    // Add cetegory with categoryName
    addCategory(categoryName, categoryWeight) {
        // Create blank category (deep copy clone) and name
        let newCat = JSON.parse(JSON.stringify(Category));
        newCat.name = categoryName;
        newCat.CategoryWeight = categoryWeight;
        // Push category to array and capture index
        let catSize = this.project.categories.push(newCat);
        // Add single Risk with weight = 100 (as new category need single Risk)
        let cat = this.getCategory(catSize-1);
        this.addRiskTo(cat, "", 100);
        // Return added category
        return cat;
    }
    // Remove last category
    removeCategory() {
        this.project.categories.pop();
    }
    // Return length of Categories array
    getCategoryLength() {
        return this.project.categories.length;
    }
    // Return category of ID
    getCategory(id) {
        return this.project.categories[id];
    }

    // Add risk to category with riskName and riskWeight
    addRiskTo(category, riskName, riskWeight) {
        // Create blank risk (deep copy clone), name and set weight
        let newRisk = JSON.parse(JSON.stringify(Risk));
        newRisk.name = riskName;
        newRisk.weight = riskWeight;
        // Push to risk array of selected category
        let risksSize = category.risks.push(newRisk);
        // Return added risk
        return category.risks[risksSize-1];
    }
    // Remove last risk from category
    removeRiskFrom(category) {
        category.risks.pop();
    }

    // SAVE FUNCTIONS

    // Save project data object to local storage (as JSON)
    saveLocal() {
        localStorage.setObject('riskAnalysisData', this.project);
    }

    // IF data stored - Load project data object from local storage (convert from JSON)
    loadLocal() {
        // EMERGENCY RESET - TEMP UNCOMMENT this.initialiseProject();
        // this.initialiseProject();
        this.project = localStorage.getObject('riskAnalysisData');
        // check for null categories project
        if (this.project.categories == null) {
            // Clear locaStorage and load test project

            this.initialiseProject();
        }
    }

    // Clear local Storage
    clearLocal() {
        localStorage.setObject('riskAnalysisData', null);

    }

    // Reset project and clear all current data from memory and local Storage
    resetProject() {
        this.initialiseProject();
    }

    // Load example project
    loadExample() {
        this.clearLocal();
        this.loadExampleProject();
        this.saveLocal();
    }


    // DATA VALIDATION

    // Check values of risk weights in each category (RISK CHERACTERISTICS PAGE) total 100
    // return array of category indexes where total weight != 100
    checkriskCharacteristicsWeights() {
        var faultsIndex = [];
        // Loop over each category
        for (var cat = 0; cat < this.project.categories.length; cat++) {
            // loop over each risk
            var total = 0;
            for (var rsk = 0; rsk < this.project.categories[cat].risks.length; rsk++) {
                // Sum weights for each risk weight
                total += this.project.categories[cat].risks[rsk].weight;
            }
            // If total != 100 push category nuber to faultsIndex
            if (total !== 100)
                faultsIndex.push(cat);
        }
        // return collection of failed category indexes
        return faultsIndex;
    }

    // Check area risk weights in each category for each area (IMPACT ASSESSMENT PAGE) total 100
    // return array of objects {category: #, risk: #, area: #} of problem groups
    checkImpactAssessmentWeights() {
        var faultsIndex = [];
        // Loop over each category
        for (var cat = 0; cat < this.project.categories.length; cat++) {
            // Loop over each risk
            for (var rsk = 0; rsk < this.project.categories[cat].risks.length; rsk++) {
                // check cost area weights
                var total = this.project.categories[cat].risks[rsk].costImpact.reduce(this.getSum);
                //console.log("COST AREA total:");
                if (total > 100) {
                    faultsIndex.push({category: cat, risk: rsk, area: 0});
                }
                // check cost duration weights
                total = this.project.categories[cat].risks[rsk].durationImpact.reduce(this.getSum);
                if (total > 100) {
                    faultsIndex.push({category: cat, risk: rsk, area: 1});
                }
                // check cost quality weights
                total = this.project.categories[cat].risks[rsk].qualityImpact.reduce(this.getSum);
                if (total > 100) {
                    faultsIndex.push({category: cat, risk: rsk, area: 2});
                }
            }
        }

        // return collection of failed category indexes
        return faultsIndex;
    }

    // Check values of all area risk weights in a category (RISK ASSESSMENT PAGE) total 100
    // return array of category indexes where total weight != 100
    checkRiskAssessmentWeights() {
        var faultsIndex = [];
        // Loop over each category
        for (var cat = 0; cat < this.project.categories.length; cat++) {
            // Sum three area weights for category
            var total = this.project.categories[cat].AreaWeights.reduce(this.getSum);
            // If total != 100 push category number to faultsIndex
            if (total !== 100)
                faultsIndex.push(cat);
        }
        // return collection of failed category indexes
        return faultsIndex;
    }

    // Check values of project weights (RESULTS PAGE) total 100 - return TRUE if = 100
    checkSummaryWeightsOk() {
        var total = 0;
        // Loop over every category
        for (var i = 0; i < this.project.categories.length; i++) {
            // Sum weights for each category
            total += this.project.categories[i].CategoryWeight;
        }
        // return TRUE if total = 100
        return (total === 100) ? true : false;
    }

    // Check values of project weights (RESULTS PAGE) total 100 - return TRUE if = 100
    checkResultsWeightsOk() {
        var total = 0;
        // Loop over every category
        for (var i = 0; i < this.project.categories.length; i++) {
            // Sum weights for each category
            total = this.project.ProjectWeights.reduce(this.getSum);
        }
        // return TRUE if total = 100
        return (total === 100) ? true : false;
    }


    // HELPER FUNCTIONS
    // Return sum of array -
    // Call using - ARRAY_TO_BE_SUMMED.reduce(this.getSum); OR ARRAY_TO_BE_SUMMED.reduce(_this.getSum); from within anonymous function
    getSum(total, num) {
        return total + num;
    }


    ////////////////// TESTING //////////////////////
    // load test problem
    loadExampleProject() {
        // Create blank project (deep copy clone) and name
        this.project = null;
        this.project = JSON.parse(JSON.stringify(Project));
        this.project.name = "Example Project";
        this.project.cost = 600000;
        this.project.ProjectWeights = [50, 40, 10];

        let cat1 = this.addCategory("Financial", 10);
        cat1.AreaWeights = [80, 20, 0];

        let risk1 = cat1.risks[0];
        risk1.name = "Deposition of surplus earth work";
        risk1.weight = 50;
        risk1.occurrence = 25;
        risk1.coefficient = 30;
        risk1.controllability = 30;
        risk1.dependency = 90;
        risk1.costImpact = [80,10,0];
        risk1.durationImpact = [0,10,0];
        risk1.qualityImpact = [0,0,0];

        let risk2 = this.addRiskTo(cat1, "Program delivery", 10);
        risk2.occurrence = 10;
        risk2.coefficient = 100;
        risk2.controllability = 30;
        risk2.dependency = 50;
        risk2.costImpact = [10,50,30];
        risk2.durationImpact = [10,50,30];
        risk2.qualityImpact = [0,0,0];

        let risk3 = this.addRiskTo(cat1, "Design growth", 20);
        risk3.occurrence = 70;
        risk3.coefficient = 100;
        risk3.controllability = 100;
        risk3.dependency = 100;
        risk3.costImpact = [80,10,10];
        risk3.durationImpact = [80,10,10];
        risk3.qualityImpact = [0,0,0];

        let risk4 = this.addRiskTo(cat1, "Sub-contractor pricing", 20);
        risk4.occurrence = 30;
        risk4.coefficient = 50;
        risk4.controllability = 30;
        risk4.dependency = 100;
        risk4.costImpact = [20,20,10];
        risk4.durationImpact = [0,0,0];
        risk4.qualityImpact = [0,0,0];



        let cat2 = this.addCategory("Technical & Operational", 20);
        cat2.AreaWeights = [50, 30, 20];

        risk1 = cat2.risks[0];
        risk1.name = "1";
        risk1.weight = 20;
        risk1.occurrence = 100;
        risk1.coefficient = 100;
        risk1.controllability = 100;
        risk1.dependency = 80;
        risk1.costImpact = [70,20,5];
        risk1.durationImpact = [0,0,0];
        risk1.qualityImpact = [0,0,0];

        risk2 = this.addRiskTo(cat2, "2", 5);
        risk2.occurrence = 10;
        risk2.coefficient = 100;
        risk2.controllability = 50;
        risk2.dependency = 100;
        risk2.costImpact = [0,0,0];
        risk2.durationImpact = [50,30,10];
        risk2.qualityImpact = [0,0,0];

        risk3 = this.addRiskTo(cat2, "3", 25);
        risk3.occurrence = 10;
        risk3.coefficient = 50;
        risk3.controllability = 50;
        risk3.dependency = 100;
        risk3.costImpact = [60,10,0];
        risk3.durationImpact = [10,20,60];
        risk3.qualityImpact = [0,0,0];

        risk4 = this.addRiskTo(cat2, "4", 50);
        risk4.occurrence = 80;
        risk4.coefficient = 100;
        risk4.controllability = 80;
        risk4.dependency = 100;
        risk4.costImpact = [60,30,10];
        risk4.durationImpact = [0,0,0];
        risk4.qualityImpact = [60,20,10];



        let cat3 = this.addCategory("Managerial & Legal", 30);
        cat3.AreaWeights = [50, 30, 20];

        risk1 = cat3.risks[0];
        risk1.name = "A";
        risk1.weight = 20;
        risk1.occurrence = 100;
        risk1.coefficient = 100;
        risk1.controllability = 100;
        risk1.dependency = 80;
        risk1.costImpact = [70,20,5];
        risk1.durationImpact = [0,0,0];
        risk1.qualityImpact = [0,0,0];

        risk2 = this.addRiskTo(cat3, "B", 5);
        risk2.occurrence = 10;
        risk2.coefficient = 100;
        risk2.controllability = 50;
        risk2.dependency = 100;
        risk2.costImpact = [0,0,0];
        risk2.durationImpact = [50,30,10];
        risk2.qualityImpact = [0,0,0];

        risk3 = this.addRiskTo(cat3, "C", 25);
        risk3.occurrence = 10;
        risk3.coefficient = 50;
        risk3.controllability = 50;
        risk3.dependency = 100;
        risk3.costImpact = [60,10,0];
        risk3.durationImpact = [10,20,60];
        risk3.qualityImpact = [0,0,0];

        risk4 = this.addRiskTo(cat3, "D", 50);
        risk4.occurrence = 80;
        risk4.coefficient = 100;
        risk4.controllability = 80;
        risk4.dependency = 100;
        risk4.costImpact = [60,30,10];
        risk4.durationImpact = [0,0,0];
        risk4.qualityImpact = [60,20,10];



        let cat4 = this.addCategory("Environmental & Social", 10);
        cat4.AreaWeights = [50, 30, 20];

        risk1 = cat4.risks[0];
        risk1.name = "E";
        risk1.weight = 20;
        risk1.occurrence = 100;
        risk1.coefficient = 100;
        risk1.controllability = 100;
        risk1.dependency = 80;
        risk1.costImpact = [70,20,5];
        risk1.durationImpact = [0,0,0];
        risk1.qualityImpact = [0,0,0];

        risk2 = this.addRiskTo(cat4, "F", 5);
        risk2.occurrence = 10;
        risk2.coefficient = 100;
        risk2.controllability = 50;
        risk2.dependency = 100;
        risk2.costImpact = [0,0,0];
        risk2.durationImpact = [50,30,10];
        risk2.qualityImpact = [0,0,0];

        risk3 = this.addRiskTo(cat4, "G", 25);
        risk3.occurrence = 10;
        risk3.coefficient = 50;
        risk3.controllability = 50;
        risk3.dependency = 100;
        risk3.costImpact = [60,10,0];
        risk3.durationImpact = [10,20,60];
        risk3.qualityImpact = [0,0,0];

        risk4 = this.addRiskTo(cat4, "H", 50);
        risk4.occurrence = 80;
        risk4.coefficient = 100;
        risk4.controllability = 80;
        risk4.dependency = 100;
        risk4.costImpact = [60,30,10];
        risk4.durationImpact = [0,0,0];
        risk4.qualityImpact = [60,20,10];



        let cat5 = this.addCategory("Health, Safety & Other", 30);
        cat5.AreaWeights = [50, 30, 20];

        risk1 = cat5.risks[0];
        risk1.name = "I";
        risk1.weight = 20;
        risk1.occurrence = 100;
        risk1.coefficient = 100;
        risk1.controllability = 100;
        risk1.dependency = 80;
        risk1.costImpact = [70,20,5];
        risk1.durationImpact = [0,0,0];
        risk1.qualityImpact = [0,0,0];

        risk2 = this.addRiskTo(cat5, "J", 5);
        risk2.occurrence = 10;
        risk2.coefficient = 100;
        risk2.controllability = 50;
        risk2.dependency = 100;
        risk2.costImpact = [0,0,0];
        risk2.durationImpact = [50,30,10];
        risk2.qualityImpact = [0,0,0];

        risk3 = this.addRiskTo(cat5, "K", 25);
        risk3.occurrence = 10;
        risk3.coefficient = 50;
        risk3.controllability = 50;
        risk3.dependency = 100;
        risk3.costImpact = [60,10,0];
        risk3.durationImpact = [10,20,60];
        risk3.qualityImpact = [0,0,0];

        risk4 = this.addRiskTo(cat5, "L", 50);
        risk4.occurrence = 80;
        risk4.coefficient = 100;
        risk4.controllability = 80;
        risk4.dependency = 100;
        risk4.costImpact = [60,30,10];
        risk4.durationImpact = [0,0,0];
        risk4.qualityImpact = [60,20,10];


    }

}
