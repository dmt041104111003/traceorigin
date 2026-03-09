export const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products', roles: ['ENTERPRISE'] as const },
  { href: '/admin/warehouse', label: 'Warehouse', roles: ['ENTERPRISE', 'TRANSIT', 'AGENT'] as const },
  { href: '/admin/order', label: 'Orders', roles: ['TRANSIT', 'AGENT', 'SHIPPER'] as const },
  { href: '/admin/account', label: 'Account' },
] as const;
