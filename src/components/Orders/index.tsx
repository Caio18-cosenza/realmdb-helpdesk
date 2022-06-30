import React, { useEffect, useState, useCallback } from 'react';
import { Alert, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Load } from '../Load';
import { Filters } from '../Filters';
import { Order, OrderProps } from '../Order';

import { Container, Header, Title, Counter } from './styles';

import { getRealm } from '../../database/realm';

export function Orders() {
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [status, setStatus] = useState('open');

  async function fetchOrders() {
    const realm = await getRealm();
    setIsLoading(true);

    console.log('Realm is located at: ' + realm.path);

    try {
      const response = realm
        .objects<OrderProps[]>('Order')
        .filtered(`status= "${status}"`)
        .sorted(`created_at`)
        .toJSON();
      setOrders(response);
    } catch {
      alert('Não foi possivel carregar os chamados!');
    } finally {
      realm.close();
      setIsLoading(false);
    }
  }

  async function OrderUpdate(id: string) {
    const realm = await getRealm();

    try {
      const orderSelected = realm
        .objects<OrderProps>('Order')
        .filtered(`_id = "${id}" `)[0];
      realm.write(() => {
        orderSelected.status =
          orderSelected.status === 'open' ? 'closed' : 'open';
      });

      Alert.alert('Chamado', 'O chamado foi atualizado!');
      fetchOrders();
    } catch {
      alert('Não foi possivel atualizar chamado');
    }
  }

  async function OrderDelete(id: string) {
    const realm = await getRealm();

    try {
      const orderSelected = realm
        .objects<OrderProps>('Order')
        .filtered(`_id = "${id}" `)[0];
      realm.write(() => {
        realm.delete(orderSelected);
      });

      Alert.alert('Chamado', 'O chamado foi deletado!');
      fetchOrders();
    } catch {
      alert('Não foi possivel deletar chamado');
    }
  }

  function handleOrderUpdate(id: string) {
    Alert.alert('Chamado', 'Encerrar chamado?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Confirmar',
        onPress: () => {
          OrderUpdate(id);
        },
      },
    ]);
  }

  function handleOrderDelete(id: string) {
    Alert.alert('Chamado', 'Deletar chamado?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Confirmar',
        onPress: () => {
          OrderDelete(id);
        },
      },
    ]);
  }

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [status])
  );

  return (
    <Container>
      <Filters onFilter={setStatus} />

      <Header>
        <Title>Chamados {status === 'open' ? 'aberto' : 'encerrado'}</Title>
        <Counter>{orders.length}</Counter>
      </Header>

      {isLoading ? (
        <Load />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Order
              data={item}
              onLongPress={() => handleOrderDelete(item._id)}
              onPress={() => handleOrderUpdate(item._id)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        />
      )}
    </Container>
  );
}
