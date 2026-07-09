import Service from '../models/Service.js';

export const getServices = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice } = req.query;
    
    let query = {};
    
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const services = await Service.find(query).populate('provider', 'name email');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider', 'name email');
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    const { title, description, price, category, deliveryTime, availability, portfolioImages } = req.body;
    const service = new Service({
      title,
      description,
      price,
      category,
      deliveryTime,
      availability: availability ?? true,
      portfolioImages: portfolioImages || [],
      provider: req.user._id
    });
    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      if (service.provider.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this service' });
      }
      service.title = req.body.title || service.title;
      service.description = req.body.description || service.description;
      service.price = req.body.price || service.price;
      service.category = req.body.category || service.category;
      service.deliveryTime = req.body.deliveryTime || service.deliveryTime;
      if (req.body.availability !== undefined) service.availability = req.body.availability;
      service.portfolioImages = req.body.portfolioImages || service.portfolioImages;

      const updatedService = await service.save();
      res.json(updatedService);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      if (service.provider.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this service' });
      }
      await service.deleteOne();
      res.json({ message: 'Service removed' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
