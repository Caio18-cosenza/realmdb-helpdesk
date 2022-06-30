import Realm from 'realm';
import { OrderSchema } from './schemas/orderSchema';

export const getRealm = async () =>
  await Realm.open({
    path: 'helpDesk',
    schema: [OrderSchema],
  });
