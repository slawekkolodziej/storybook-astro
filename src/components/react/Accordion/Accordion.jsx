import { useState } from 'react';

function Accordion({ items = [], allowMultiple = false }) {
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  return (
    <div data-testid="react-accordion" className="accordion">
      {items.map((item, index) => (
        <div key={index} className="accordion-item">
          <button
            className="accordion-header"
            onClick={() => toggleItem(index)}
            aria-expanded={openIndexes.includes(index)}
          >
            {item.title}
            <span className="accordion-icon">
              {openIndexes.includes(index) ? '−' : '+'}
            </span>
          </button>
          {openIndexes.includes(index) && (
            <div className="accordion-content">
              {item.content}
            </div>
          )}
        </div>
      ))}
      <style>{`
        .accordion {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }
        .accordion-item {
          border-bottom: 1px solid #e0e0e0;
        }
        .accordion-item:last-child {
          border-bottom: none;
        }
        .accordion-header {
          width: 100%;
          padding: 1rem;
          background: #f5f5f5;
          border: none;
          text-align: left;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1rem;
          font-weight: 500;
          transition: background 0.2s;
        }
        .accordion-header:hover {
          background: #ebebeb;
        }
        .accordion-icon {
          font-size: 1.25rem;
          font-weight: bold;
        }
        .accordion-content {
          padding: 1rem;
          background: white;
        }
      `}</style>
    </div>
  );
}

export default Accordion;
