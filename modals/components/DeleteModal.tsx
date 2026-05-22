import { DeleteModalProperties } from '../../src/models/modals';

type DeleteModalProps = {
  handleError: (message: string, error: unknown) => void;
  handleToast: (message: string) => void;
  modalData: DeleteModalProperties;
};

export const DeleteModal = (props: DeleteModalProps) => {
  const { handleError, handleToast, modalData } = props;

  const onDelete = async () => {
    try {
      const item = await miro.board.getById(modalData.id);
      await miro.board.remove(item);
      handleToast('Item deleted');
    } catch (error) {
      handleError('Error deleting item', error);
    }
  };

  const onCancel = async () => {
    await miro.board.ui.closeModal();
  };

  return (
    <div>
      <p className="ally-wb-delete-dialog-message">Are you sure you want to delete this item?</p>

      <div className="ally-wb-delete-dialog-buttons">
        <button type="button" onClick={onDelete}>
          Yes, delete
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};
