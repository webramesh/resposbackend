const { getKitchenOrdersDB, updateOrderItemStatusDB } = require("../services/kitchen.service");

exports.getKitchenOrders = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const {addons,kitchenOrders,kitchenOrdersItems} = await getKitchenOrdersDB(tenantId);

    const formattedOrders = kitchenOrders.map((order)=>{
      const orderItems = kitchenOrdersItems.filter((oi)=>oi.order_id == order.id);
      
      orderItems.forEach((oi, index)=>{
        const addonsIds = oi?.addons ? JSON.parse(oi?.addons) : null;

        if(addonsIds) {
          const itemAddons = addonsIds.map((addonId)=>{
            const addon = addons.filter((a)=>a.id == addonId);
            return addon[0];
          });
          orderItems[index].addons = [...itemAddons];
        }
      });

      return {
        ...order,
        items: orderItems
      }
    })

    return res.status(200).json(formattedOrders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong! Please try later!",
    });
  }
};

exports.updateKitchenOrderItemStatus = async (req, res) => {
  try {
    const orderItemId = req.params.id;
    const { status } = req.body

    if(!status) {
      return res.status(400).json({
        success: false,
        message: "Invalid Request!"
      });
    }

    await updateOrderItemStatusDB(orderItemId, status)

    return res.status(200).json({
      success: true,
      message: "Order Item Status updated"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong! Please try later!",
    });
  }
};