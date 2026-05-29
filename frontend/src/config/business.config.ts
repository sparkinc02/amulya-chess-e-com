/**
 * Centralized business configuration for Amulya Chess.
 * Use this file to update GST, Shipping costs, and Support contact details.
 */

export const BUSINESS_CONFIG = {
  company: {
    name: "Amulya Chess",
  },
  pricing: {
    gstPercentage: 18,
    shippingThreshold: 5000,
    shippingCost: 0, // Currently set to 0 as per requirements
  },
  support: {
    email: "support@amulyachessproducts.in",
    phone: "+91 98765 43210",
    whatsapp: "919876543210",
    address: "42, Chess Lane, T. Nagar, Chennai – 600017, Tamil Nadu, India",
    instagram: "chesscraftindia",
    mapsLink:
      "https://www.google.com/maps/search/?api=1&query=42,+Chess+Lane,+T.+Nagar,+Chennai+–+600017",
  },
};
