/**
 * Calculate the number of bundles and cartons needed based on product packaging details
 * @param {number} totalQuantity - Total number of pieces to be dispatched
 * @param {Object} packagingDetails - Product's packaging configuration
 * @param {number} packagingDetails.piecesInPack - Number of pieces in one bundle/pack
 * @param {number} packagingDetails.piecesInBox - Number of pieces in one carton/box
 * @returns {Object} Calculated number of bundles and cartons
 */
const calculatePackaging = (totalQuantity, packagingDetails) => {
    const { piecesInPack, piecesInBox } = packagingDetails;
    
    // Calculate bundles
    const calculatedBundles = piecesInPack ? Math.ceil(totalQuantity / piecesInPack) : 0;
    
    // Calculate cartons
    const calculatedCartons = piecesInBox ? Math.ceil(totalQuantity / piecesInBox) : 0;
    
    return {
        bundles: {
            calculated: calculatedBundles
        },
        cartons: {
            calculated: calculatedCartons
        }
    };
};

module.exports = calculatePackaging;
