// Array of country objects for the flag dropdown.

// Here is the criteria for the plugin to support a given country/territory
// - It has an iso2 code: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
// - It has it's own country calling code (it is not a sub-region of another country): https://en.wikipedia.org/wiki/List_of_country_calling_codes
// - It has a flag in the region-flags project: https://github.com/behdad/region-flags/tree/gh-pages/png
// - It is supported by libphonenumber (it must be listed on this page): https://github.com/googlei18n/libphonenumber/blob/master/resources/ShortNumberMetadata.xml

// Each country array has the following information:
// [
//    Country name,
//    iso2 code,
//    International dial code,
//    Order (if >1 country with same dial code),
//    Area codes
// ]
const allLanguages = [
    ["Russian (Русский)", "ru-RU", 'ru'],
    ["English (United Kingdom)", "en-GB", 'gb'],
    ["English (United States)", "en-US", 'us']
  ];
  
  export default allLanguages.map(([name, iso2, isohack]) => ({

    name,
    isohack: isohack,
    iso2 : iso2,
    
  }));
  