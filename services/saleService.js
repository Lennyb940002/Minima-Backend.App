const Sale = require('../models/Sale'); // Import du modèle Sale

class SaleService {
    static async getAll(userId) {
        try {
            console.log(`Fetching all sales for user: ${userId}`);
            const sales = await Sale.find({ userId }).sort({ date: -1 });
            console.log(`Found ${sales.length} sales`);
            return sales;
        } catch (error) {
            console.error('Error in SaleService.getAll:', error);
            throw error;
        }
    }

    static async create(saleData, userId) {
        try {
            console.log(`Creating sale for user: ${userId}`, saleData);
            const sale = new Sale({
                userId,
                product: saleData.product,
                quantity: saleData.quantity,
                salePrice: saleData.salePrice,
                unitCost: saleData.unitCost,
                paymentStatus: saleData.paymentStatus,
                date: saleData.date || new Date(),
                margin: (saleData.salePrice - saleData.unitCost) * saleData.quantity,
                decStatus: 1
            });
            
            const savedSale = await sale.save();
            console.log('Sale created successfully:', savedSale);
            return savedSale;
        } catch (error) {
            console.error('Error in SaleService.create:', error);
            throw error;
        }
    }

    static async update(id, saleData, userId) {
        try {
            console.log(`Updating sale ${id} for user: ${userId}`, saleData);
            const updatedData = {
                ...saleData,
                margin: (saleData.salePrice - saleData.unitCost) * saleData.quantity
            };

            const updatedSale = await Sale.findOneAndUpdate(
                { _id: id, userId },
                updatedData,
                { new: true, runValidators: true }
            );

            if (!updatedSale) {
                console.log(`Sale ${id} not found for user ${userId}`);
            } else {
                console.log('Sale updated successfully:', updatedSale);
            }
            
            return updatedSale;
        } catch (error) {
            console.error('Error in SaleService.update:', error);
            throw error;
        }
    }

    static async updateDecStatus(id, userId) {
        try {
            console.log(`Updating decStatus for sale ${id} for user: ${userId}`);
            const updatedSale = await Sale.findOneAndUpdate(
                { _id: id, userId },
                { decStatus: 2 },
                { new: true }
            );

            if (!updatedSale) {
                console.log(`Sale ${id} not found for user ${userId}`);
            } else {
                console.log('DecStatus updated successfully:', updatedSale);
            }
            
            return updatedSale;
        } catch (error) {
            console.error('Error in SaleService.updateDecStatus:', error);
            throw error;
        }
    }

    static async delete(id, userId) {
        try {
            console.log(`Deleting sale ${id} for user: ${userId}`);
            const deletedSale = await Sale.findOneAndDelete({ _id: id, userId });
            
            if (!deletedSale) {
                console.log(`Sale ${id} not found for user ${userId}`);
            } else {
                console.log('Sale deleted successfully:', deletedSale);
            }
            
            return deletedSale;
        } catch (error) {
            console.error('Error in SaleService.delete:', error);
            throw error;
        }
    }

    static async getSalesAnalytics(userId) {
        try {
            console.log(`Getting sales analytics for user: ${userId}`);
            const sales = await Sale.find({ userId });
            console.log(`Found ${sales.length} sales for analytics`);
            
            // Calculer les statistiques nécessaires à partir des ventes
            const totalDays = sales.length ? 
                Math.max(1, (new Date() - new Date(Math.min(...sales.map(s => new Date(s.date))))) / (1000 * 60 * 60 * 24)) : 0;
            
            const completedSales = sales.filter(sale => sale.paymentStatus === 'Effectué').length;
            const conversionRate = sales.length ? completedSales / sales.length : 0;
            
            const analytics = { 
                totalDays, 
                conversionRate,
                totalSales: sales.length,
                completedSales
            };
            
            console.log('Analytics calculated:', analytics);
            return analytics;
        } catch (error) {
            console.error('Error in SaleService.getSalesAnalytics:', error);
            throw error;
        }
    }
}

module.exports = { SaleService };
