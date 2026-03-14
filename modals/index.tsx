import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { ModalProperties } from '../src/models/modals';
import { AddModal } from './components/AddModal';

const App: React.FC = () => {
  const title = React.useRef<HTMLHeadingElement | null>(null);
  const [modalData, setModalData] = React.useState<ModalProperties | undefined>();
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [successMessage, setSuccessMessage] = React.useState<string>('');

  React.useEffect(() => {
    const focusTitle = () => title?.current?.focus();

    window.addEventListener('DOMContentLoaded', focusTitle);

    return () => {
      window.removeEventListener('DOMContentLoaded', focusTitle);
    };
  }, [window, title]);

  const fetchModalData = async () => {
    try {
      const response: ModalProperties | undefined = await miro.board.ui.getModalData();
      setModalData(response);
    } catch (error) {
      handleError('Error loading form', error);
    }
  };

  React.useEffect(() => {
    fetchModalData();
  }, []);

  const handleError = (message: string, error: unknown) => {
    console.error(`${message}: ${error}`);
    setErrorMessage(message);
  };

  const handleToast = (message: string) => {
    setSuccessMessage(message);

    setTimeout(async () => {
      const modalIsClosed = await miro.board.ui.canOpenModal();
      if (!modalIsClosed) {
        await miro.board.ui.closeModal();
      }
    }, 2000);
  };

  const modalContent = React.useMemo(() => {
    if (modalData) {
      switch (modalData.action) {
        case 'add':
          return (
            <AddModal handleError={handleError} handleToast={handleToast} modalData={modalData} />
          );
        default:
          return <></>;
      }
    }

    return <></>;
  }, [modalData]);

  return (
    <div>
      <header className="ally-wb-edit-form-header">
        <h2 tabIndex={-1} ref={title}>
          {modalData?.title}
        </h2>
      </header>

      {modalContent}

      <p role="status" className="ally-wb-edit-form-errors">
        {errorMessage}
      </p>
      <p role="alert" className="ally-wb-edit-form-success">
        {successMessage}
      </p>
    </div>
  );
};

const container = document.getElementById('a11ywb-modal-root');
const root = container ? createRoot(container) : null;

function render() {
  root?.render(<App />);
}

render();
