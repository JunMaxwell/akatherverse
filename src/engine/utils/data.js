const CHARACTER_MODELS = {
    'simple': {
        'Male': ['BusinessMan'],
        'Female': ['Doctor']
    },
    'normal': {
        'Male': [
            'City_Male_Business_Chr_01',
            'City_Male_Jacket_Chr',
            // 'Town_Male_Jacket_Chr',
            'City_Male_Business_Chr_02',
            'Office_Male_Boss_Chr_01', 
            'Office_Male_Business_Chr_01', 
            'Office_Male_Business_Chr_02', 
            // 'Office_Male_Business_Chr_03',
            'Office_Male_Business_Chr_04',
            'Office_Male_Developer_Chr_01'
        ],
        'Female': [
            'City_Female_Business_Chr',
            'City_Female_Coat_Chr',
            'Office_Female_Boss_Chr_01',
            'Office_Female_Business_Chr_01',
            'Office_Female_Business_Chr_02',
            // 'Office_Female_Business_Chr_03',
            'Office_Female_Business_Chr_04',
            'Office_Female_Developer_Chr_01',
            'Office_Female_Developer_Chr_02'
        ]
    }
};

const CHARACTER_COLOR = ['Black', 'Brown', 'White'];
const TEXTURE_NUMBER = ['01', '02', '03', '04'];
const TEXTURE_LETTER = ['A', 'B', 'C'];

var DataManager = (function () {
    var instance;
    
    function createInstance() {
        var object = new Object("Our3D.Space");
        
        object.animations = [];
        object.activeZones = [];
        return object;
    }
    
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        },

        getModelForGender: function (gender) {
            if (!this.characterSet) this.characterSet = 'normal';
    
            let modelList = CHARACTER_MODELS[this.characterSet][gender];
            return modelList[Math.floor(Math.random()*modelList.length)];
        }
    };
})();

export { DataManager }