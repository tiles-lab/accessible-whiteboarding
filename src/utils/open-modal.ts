import { Item } from '@mirohq/websdk-types';

import {
  AddModalProperties,
  ConnectModalProperties,
  DeleteModalProperties,
  EditModalProperties,
} from '@models/modals';

const MODAL_URL = 'modals/index.html';

export const openAddModal = async (props: Omit<AddModalProperties, 'action'>) => {
  if (await miro.board.ui.canOpenModal()) {
    await miro.board.ui.openModal<AddModalProperties>({
      data: { ...props, action: 'add' },
      url: MODAL_URL,
      width: 600,
      height: 400,
      fullscreen: false,
    });
  }
};

export const openConnectModal = async (props: Omit<ConnectModalProperties, 'action'>) => {
  if (await miro.board.ui.canOpenModal()) {
    await miro.board.ui.openModal<ConnectModalProperties>({
      data: { ...props, action: 'connect' },
      url: MODAL_URL,
      width: 600,
      height: 400,
      fullscreen: false,
    });
  }
};

export const openDeleteModal = async (props: Omit<DeleteModalProperties, 'action'>) => {
  if (await miro.board.ui.canOpenModal()) {
    await miro.board.ui.openModal<DeleteModalProperties>({
      data: { ...props, action: 'delete' },
      url: MODAL_URL,
      width: 350,
      height: 150,
      fullscreen: false,
    });
  }
};

export const openEditModal = async <T extends Item>(
  props: Omit<EditModalProperties<T>, 'action'>,
) => {
  if (await miro.board.ui.canOpenModal()) {
    await miro.board.ui.openModal<EditModalProperties<T>>({
      data: { ...props, action: 'edit' },
      url: MODAL_URL,
      width: 600,
      height: 400,
      fullscreen: false,
    });
  }
};
