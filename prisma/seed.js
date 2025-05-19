"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var axios_1 = require("axios");
var countries_list_1 = require("countries-list");
var prisma = new client_1.PrismaClient();
var INDIA_ISO2 = 'IN';
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var countryEntries, _i, countryEntries_1, entry, e_1, india, stateRes, allStates, indianStates, _loop_1, _a, indianStates_1, state;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    countryEntries = Object.values(countries_list_1.countries).map(function (country) { return ({
                        country_name: country.name,
                    }); });
                    _i = 0, countryEntries_1 = countryEntries;
                    _b.label = 1;
                case 1:
                    if (!(_i < countryEntries_1.length)) return [3 /*break*/, 6];
                    entry = countryEntries_1[_i];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, prisma.country.create({
                            data: { country_name: entry.country_name },
                        })];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _b.sent();
                    if (e_1.code === 'P2002')
                        return [3 /*break*/, 5]; // Skip duplicate country
                    console.error("Failed to insert country: ".concat(entry.country_name), e_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [4 /*yield*/, prisma.country.findFirst({
                        where: { country_name: 'India' },
                    })];
                case 7:
                    india = _b.sent();
                    if (!india)
                        throw new Error('India not found in database');
                    return [4 /*yield*/, axios_1.default.get('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/refs/heads/master/json/states.json')];
                case 8:
                    stateRes = _b.sent();
                    allStates = stateRes.data;
                    indianStates = allStates.filter(function (state) { return state.country_code === INDIA_ISO2; });
                    _loop_1 = function (state) {
                        var newState_1, cityRes, allCities, matchingCities, err_1;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 5, , 6]);
                                    return [4 /*yield*/, prisma.state.create({
                                            data: {
                                                state_name: state.name,
                                                country_id: india.id,
                                            },
                                        })];
                                case 1:
                                    newState_1 = _c.sent();
                                    return [4 /*yield*/, axios_1.default.get('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/refs/heads/master/json/cities.json')];
                                case 2:
                                    cityRes = _c.sent();
                                    allCities = cityRes.data;
                                    matchingCities = allCities.filter(function (city) {
                                        return city.country_code === INDIA_ISO2 && city.state_code === state.state_code;
                                    });
                                    if (!(matchingCities.length > 0)) return [3 /*break*/, 4];
                                    return [4 /*yield*/, prisma.city.createMany({
                                            data: matchingCities.map(function (city) { return ({
                                                city_name: city.name,
                                                state_id: newState_1.id,
                                            }); }),
                                            skipDuplicates: true,
                                        })];
                                case 3:
                                    _c.sent();
                                    console.log("\u2705 Added ".concat(matchingCities.length, " cities for ").concat(state.name));
                                    _c.label = 4;
                                case 4: return [3 /*break*/, 6];
                                case 5:
                                    err_1 = _c.sent();
                                    console.error("\u274C Error processing state ".concat(state.name), err_1);
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    };
                    _a = 0, indianStates_1 = indianStates;
                    _b.label = 9;
                case 9:
                    if (!(_a < indianStates_1.length)) return [3 /*break*/, 12];
                    state = indianStates_1[_a];
                    return [5 /*yield**/, _loop_1(state)];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11:
                    _a++;
                    return [3 /*break*/, 9];
                case 12:
                    console.log('🎉 All data seeded!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Error in seeding process', e);
    process.exit(1);
})
    .finally(function () {
    prisma.$disconnect();
});
