export const BOARD_UPDATE_CHANNEL = 'accessible-whiteboarding-board-update';

export const notifyBoardUpdate = (): void => {
  const channel = new BroadcastChannel(BOARD_UPDATE_CHANNEL);
  channel.postMessage(null);
  channel.close();
};
