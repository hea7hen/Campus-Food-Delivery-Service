let orders = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(orders);
  }
  if (req.method === 'POST') {
    const order = { ...req.body, id: Date.now(), status: 'Pending' };
    orders.push(order);
    return res.status(200).json(order);
  }
  if (req.method === 'PUT') {
    const { orderId, courier } = req.body;
    const o = orders.find(o=>o.id===orderId);
    if (o) {
      o.status = 'In Progress';
      o.courier = courier;
      return res.status(200).json(o);
    }
    return res.status(404).end();
  }
  res.status(405).end();
}