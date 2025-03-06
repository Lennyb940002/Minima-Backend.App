class SaleService {
    static async getAll(userId) {
        return await Sale.find({ userId }).sort({ date: -1 });
    }

    static async create(saleData, userId) {
        try {
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
            return savedSale;
        } catch (error) {
            console.error('Error in SaleService.create:', error);
            throw error;
        }
    }

    static async update(id, saleData, userId) {
        try {
            const updatedData = {
                ...saleData,
                margin: (saleData.salePrice - saleData.unitCost) * saleData.quantity
            };

            const updatedSale = await Sale.findOneAndUpdate(
                { _id: id, userId },
                updatedData,
                { new: true, runValidators: true }
            );

            return updatedSale;
        } catch (error) {
            console.error('Error in SaleService.update:', error);
            throw error;
        }
    }

    static async updateDecStatus(id, userId) {
        try {
            const updatedSale = await Sale.findOneAndUpdate(
                { _id: id, userId },
                { decStatus: 2 },
                { new: true }
            );
            return updatedSale;
        } catch (error) {
            console.error('Error in SaleService.updateDecStatus:', error);
            throw error;
        }
    }

    static async delete(id, userId) {
        return await Sale.findOneAndDelete({ _id: id, userId });
    }

    static async getSalesAnalytics(userId) {
        try {
            const sales = await Sale.find({ userId });
            // Calculer les statistiques nécessaires à partir des ventes
            const totalDays = sales.length ? (new Date() - new Date(sales[sales.length - 1].date)) / (1000 * 60 * 60 * 24) : 0;
            const conversionRate = sales.length ? sales.filter(sale => sale.paymentStatus === 'Effectué').length / sales.length : 0;
            return { totalDays, conversionRate };
        } catch (error) {
            console.error('Error in SaleService.getSalesAnalytics:', error);
            throw error;
        }
    }
}

module.exports = { SaleService };
