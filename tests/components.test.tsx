/**
 * Dosyanın görevi: Gerçek formdaki kontrollü etiket değerini test sırasında taklit eder.
 * Kullanıldığı yerler: Derleme aracı veya ilgili çalışma komutu tarafından yüklenir.
 */
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import ConfirmModal from '@/components/admin/ConfirmModal';
import TagInput from '@/components/admin/TagInput';

afterEach(cleanup);

/** Gerçek formdaki kontrollü etiket değerini test sırasında taklit eder. */
function TagsForm() {
  const [tags, setTags] = useState<string[]>([]);
  return <TagInput value={tags} onChange={setTags} />;
}

describe('Ortak yönetim kontrolleri', () => {
  it('Virgül ve Enter ile ayrı etiketler ekler, tekrarları tekilleştirir', async () => {
    const user = userEvent.setup();
    render(<TagsForm />);
    await user.type(screen.getByRole('textbox'), 'toprak,sulama{Enter}toprak{Enter}');
    expect(screen.getByText('#toprak')).toBeTruthy();
    expect(screen.getByText('#sulama')).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
  it('Yapıştırılan çoklu etiketleri ayırır', () => {
    render(<TagsForm />);
    fireEvent.paste(screen.getByRole('textbox'), { clipboardData: { getData: () => 'toprak, sulama, verimlilik' } });
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
  it('Enter onayı bir kez çalıştırır; işlem sürerken tekrar Enter yeni iş başlatmaz', async () => {
    let finish!: () => void;
    const confirm = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
    render(<ConfirmModal isOpen onClose={vi.fn()} onConfirm={confirm} title="Silme onayı" message="Makale silinsin mi?" />);
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(confirm).toHaveBeenCalledTimes(1);
    await act(async () => { finish(); });
  });
  it('Yüklenirken ve kapalıyken klavye onayı çalışmaz', () => {
    const confirm = vi.fn();
    const view = render(<ConfirmModal isOpen isLoading onClose={vi.fn()} onConfirm={confirm} title="Onay" message="İşlem" />);
    fireEvent.keyDown(document, { key: 'Enter' });
    view.rerender(<ConfirmModal isOpen={false} onClose={vi.fn()} onConfirm={confirm} title="Onay" message="İşlem" />);
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(confirm).not.toHaveBeenCalled();
  });
});
