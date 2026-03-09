import type { Product } from '../../types';
import { truncate } from '../../utils/string';

type Props = {
  styles: Record<string, string>;
  items: Product[];
  onDetail?: (p: Product) => void;
  onEdit: (p: Product) => void;
  onRevoke: (id: number) => void;
  onDownloadQr: (p: Product) => void;
};

export function ProductsCards({ styles, items, onDetail, onEdit, onRevoke, onDownloadQr }: Props) {
  return (
    <div className={styles.tableCards}>
      {items.length === 0 ? null : (
        items.map((p) => (
        <div key={p.id} className={styles.tableCard}>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Batch ID</span>
            <span className={styles.tableCardValue} title={p.code}>
              {truncate(p.code, 18)}
            </span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Name</span>
            <span className={styles.tableCardValue} title={p.nameEn}>
              {truncate(p.nameEn)}
            </span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>SKU</span>
            <span className={styles.tableCardValue} title={p.sku ?? ''}>
              {truncate(p.sku)}
            </span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Image</span>
            <span className={styles.tableCardValue}>
              {p.imageUrl ? 'Yes' : '—'}
            </span>
          </div>
          <div className={styles.tableCardActions}>
            <div className={styles.actions}>
              {onDetail && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => onDetail(p)}
                  title="View details"
                >
                  Detail
                </button>
              )}
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => p.canUpdate !== false && onEdit(p)}
                disabled={p.canUpdate === false}
                title={p.canUpdate === false ? 'Cannot edit: NFT already sent' : 'Edit'}
              >
                Edit
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => onRevoke(p.id)}
              >
                Revoke
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => onDownloadQr(p)}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      ))
      )}
    </div>
  );
}
