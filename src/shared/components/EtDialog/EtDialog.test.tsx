import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EtDialog from './index';

// Setup for React Portal: Create and clean up the #dialog-root element in JSDOM.
let dialogRoot: HTMLElement;
let consoleWarnSpy: jest.SpyInstance;

// Store original native HTMLDialogElement methods to restore them after all tests.
let originalShowModal: (this: HTMLDialogElement) => void;
let originalClose: (this: HTMLDialogElement) => void;

beforeEach(() => {
  // Set up the portal root element in the DOM for each test.
  dialogRoot = document.createElement('div');
  dialogRoot.setAttribute('id', 'dialog-root');
  document.body.appendChild(dialogRoot);

  // Store original methods before mocking.
  originalShowModal = HTMLDialogElement.prototype.showModal;
  originalClose = HTMLDialogElement.prototype.close;

  // Mock native HTMLDialogElement methods to control the 'open' attribute.
  // This is crucial for `toBeVisible()` and accessibility queries to work for <dialog> in JSDOM.
  HTMLDialogElement.prototype.showModal = jest.fn(function(this: HTMLDialogElement) {
    this.setAttribute('open', ''); // Manually add 'open' attribute to simulate dialog opening
  });
  HTMLDialogElement.prototype.close = jest.fn(function(this: HTMLDialogElement) {
    this.removeAttribute('open'); // Manually remove 'open' attribute to simulate dialog closing
  });

  // Spy on console.warn to suppress it during tests, unless specifically testing warnings.
  consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  document.body.removeChild(dialogRoot); // Clean up the portal root.
  jest.clearAllMocks(); // Clear all mock calls.

  // Restore original methods to avoid affecting other tests or environments.
  HTMLDialogElement.prototype.showModal = originalShowModal;
  HTMLDialogElement.prototype.close = originalClose;

  // Restore console.warn after each test.
  consoleWarnSpy.mockRestore();
});


describe('EtDialog', () => {
  const defaultProps = {
    isOpen: false,
    onClose: jest.fn(),
    title: 'Test Title',
    children: <p>Test Content</p>,
  };

  test('does not render dialog content visibly when isOpen is false', () => {
    render(<EtDialog {...defaultProps} isOpen={false} />);

    // Query for the dialog element. It should be in the DOM but not open.
    const dialogElement = screen.queryByRole('dialog', { hidden: true });
    expect(dialogElement).toBeInTheDocument();
    expect(dialogElement).not.toHaveAttribute('open'); // Verify 'open' attribute explicitly.
    expect(dialogElement).not.toBeVisible(); // Should pass as 'open' attribute is not present.
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  test('renders dialog content and calls showModal when isOpen is true', () => {
    render(<EtDialog {...defaultProps} isOpen={true} />);

    // Get the dialog element. It should be in the DOM and open.
    const dialogElement = screen.getByRole('dialog', { hidden: true });
    expect(dialogElement).toBeInTheDocument();
    expect(dialogElement).toHaveAttribute('open'); // Verify 'open' attribute.
    expect(dialogElement).toBeVisible(); // Should pass because 'open' attribute is set by the mock.
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when the close button is clicked', async () => {
    const onCloseMock = jest.fn();
    // Render the dialog initially open.
    const { rerender } = render(<EtDialog {...defaultProps} isOpen={true} onClose={onCloseMock} />);

    const dialogElement = screen.getByRole('dialog', { hidden: true });
    // Use 'within' to query the button specifically inside the dialog.
    const closeButton = within(dialogElement).getByRole('button', { name: 'Close dialog', hidden: true });
    
    // Simulate click, which directly calls the onClose prop.
    fireEvent.click(closeButton);

    // Expect the onClose prop to have been called immediately.
    expect(onCloseMock).toHaveBeenCalledTimes(1); 

    // IMPORTANT: The EtDialog component only closes the native <dialog>
    // when its 'isOpen' prop changes from true to false.
    // We must simulate the parent component re-rendering EtDialog with isOpen=false.
    rerender(<EtDialog {...defaultProps} isOpen={false} onClose={onCloseMock} />);

    // Now, wait for the useEffect in EtDialog to call dialogElement.close()
    // and for the dialog to no longer be open/visible.
    await waitFor(() => {
      expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
      expect(dialogElement).not.toHaveAttribute('open');
      expect(dialogElement).not.toBeVisible();
    });
  });

  test('calls onClose when native dialog close event is dispatched', async () => {
    const onCloseMock = jest.fn();
    let dialogElement: HTMLDialogElement; 
    
    // Render the component and ensure the listener is attached.
    const { rerender } = render(<EtDialog {...defaultProps} isOpen={true} onClose={onCloseMock} />);

    // Get the reference to the DOM element after initial render.
    dialogElement = screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement;

    // Dispatch the native 'close' event on the dialog element.
    // This should trigger the useEffect that has the addEventListener('close', handleClose).
    await act(async () => {
      fireEvent(dialogElement, new Event('close'));
    });

    // Wait for the onClose mock to be called as a result of the event.
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    // IMPORTANT: Once onClose has been called, we must simulate the parent component
    // reacting to that call and re-rendering EtDialog with isOpen=false.
    rerender(<EtDialog {...defaultProps} isOpen={false} onClose={onCloseMock} />);

    // Now, expect the useEffect controlling isOpen to have called dialogElement.close()
    // and for the dialog to no longer be open/visible.
    await waitFor(() => {
      expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
      expect(dialogElement).not.toHaveAttribute('open');
      expect(dialogElement).not.toBeVisible();
    });
  });

  test('applies correct slideFrom class', () => {
    const { rerender } = render(<EtDialog {...defaultProps} isOpen={true} slideFrom="right" />);
    const dialogElement = screen.getByRole('dialog', { hidden: true });
    expect(dialogElement).toHaveClass('et-dialog--slide-right');

    rerender(<EtDialog {...defaultProps} isOpen={true} slideFrom="left" />);
    expect(dialogElement).toHaveClass('et-dialog--slide-left');

    rerender(<EtDialog {...defaultProps} isOpen={true} slideFrom="none" />);
    expect(dialogElement).not.toHaveClass('et-dialog--slide-right');
    expect(dialogElement).not.toHaveClass('et-dialog--slide-left');
  });

  test('applies custom className', () => {
    render(<EtDialog {...defaultProps} className="my-custom-class" isOpen={true} />);
    const dialogElement = screen.getByRole('dialog', { hidden: true });
    expect(dialogElement).toHaveClass('my-custom-class');
  });

  test('renders null if dialog-root element is not found', () => {
    // Restore console.warn to capture its output for this specific test.
    consoleWarnSpy.mockRestore();
    const consoleWarnSpyForThisTest = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Temporarily remove dialogRoot from the DOM for this test.
    document.body.removeChild(dialogRoot);
    
    const { container } = render(<EtDialog {...defaultProps} isOpen={true} />);
    expect(container).toBeEmptyDOMElement();
    
    // Assert that the warning was called.
    expect(consoleWarnSpyForThisTest).toHaveBeenCalledWith("Portal root element with ID 'dialog-root' not found. Dialog will not render.");
    
    // Restore the spy for this test.
    consoleWarnSpyForThisTest.mockRestore();

    // Re-add dialogRoot immediately for subsequent tests in the same suite.
    document.body.appendChild(dialogRoot);
  });
});