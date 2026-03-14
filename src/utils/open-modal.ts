import { Item } from '@mirohq/websdk-types';

import {
  AddModalProperties,
  ConnectModalProperties,
  DeleteModalProperties,
  EditModalProperties,
  MoveModalProperties,
} from '@models/modals';

export const openAddModal = async (props: Omit<AddModalProperties, 'action'>) => {
  if (await miro.board.ui.canOpenModal()) {
    await miro.board.ui.openModal<AddModalProperties>({
      data: { ...props, action: 'add' },
      url: 'modals/add-dialog.html',
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
      url: 'modals/connections-dialog.html',
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
      url: 'modals/delete-dialog.html',
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
      url: 'modals/edit-dialog.html',
      width: 600,
      height: 400,
      fullscreen: false,
    });
  }
};

export const openMoveModal = async (props: Omit<MoveModalProperties, 'action'>) => {
  if (await miro.board.ui.canOpenModal()) {
    await miro.board.ui.openModal<MoveModalProperties>({
      data: { ...props, action: 'move' },
      url: 'modals/move-dialog.html',
      width: 600,
      height: 400,
      fullscreen: false,
    });
  }
};
