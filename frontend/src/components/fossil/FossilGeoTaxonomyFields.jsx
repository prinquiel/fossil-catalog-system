import { useEffect, useState } from 'react';
import { geologyTaxonomyService } from '../../services/geologyTaxonomyService';

/**
 * Selects en cascada: era → período; reino → … → especie.
 * @param {{ form: Record<string, string>, setForm: React.Dispatch<React.SetStateAction<any>>, disabled?: boolean, idPrefix?: string, showTaxonomy?: boolean, showSpecies?: boolean }} props
 */
export default function FossilGeoTaxonomyFields({
  form,
  setForm,
  disabled = false,
  idPrefix = '',
  showTaxonomy = true,
  showSpecies = true,
}) {
  const [eras, setEras] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [kingdoms, setKingdoms] = useState([]);
  const [phylums, setPhylums] = useState([]);
  const [classes, setClasses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [families, setFamilies] = useState([]);
  const [genera, setGenera] = useState([]);
  const [species, setSpecies] = useState([]);

  useEffect(() => {
    let m = true;
    geologyTaxonomyService.getEras().then((res) => {
      if (m && res.success && Array.isArray(res.data)) setEras(res.data);
    });
    if (showTaxonomy) {
      geologyTaxonomyService.getKingdoms().then((res) => {
        if (m && res.success && Array.isArray(res.data)) setKingdoms(res.data);
      });
    }
    return () => {
      m = false;
    };
  }, [showTaxonomy]);

  useEffect(() => {
    let m = true;
    if (!form.era_id) {
      queueMicrotask(() => {
        if (m) setPeriods([]);
      });
      return () => {
        m = false;
      };
    }
    geologyTaxonomyService.getPeriodsByEra(form.era_id).then((res) => {
      if (m && res.success && Array.isArray(res.data)) setPeriods(res.data);
    });
    return () => {
      m = false;
    };
  }, [form.era_id]);

  useEffect(() => {
    let m = true;
    if (!showTaxonomy) {
      queueMicrotask(() => {
        if (m) setPhylums([]);
      });
      return () => {
        m = false;
      };
    }
    if (!form.kingdom_id) {
      queueMicrotask(() => {
        if (m) setPhylums([]);
      });
      return () => {
        m = false;
      };
    }
    geologyTaxonomyService.getPhylumsByKingdom(form.kingdom_id).then((res) => {
      if (m && res.success && Array.isArray(res.data)) setPhylums(res.data);
    });
    return () => {
      m = false;
    };
  }, [form.kingdom_id, showTaxonomy]);

  useEffect(() => {
    let m = true;
    if (!showTaxonomy) {
      queueMicrotask(() => {
        if (m) setClasses([]);
      });
      return () => {
        m = false;
      };
    }
    if (!form.phylum_id) {
      queueMicrotask(() => {
        if (m) setClasses([]);
      });
      return () => {
        m = false;
      };
    }
    geologyTaxonomyService.getClassesByPhylum(form.phylum_id).then((res) => {
      if (m && res.success && Array.isArray(res.data)) setClasses(res.data);
    });
    return () => {
      m = false;
    };
  }, [form.phylum_id, showTaxonomy]);

  useEffect(() => {
    let m = true;
    if (!showTaxonomy) {
      queueMicrotask(() => {
        if (m) setOrders([]);
      });
      return () => {
        m = false;
      };
    }
    if (!form.class_id) {
      queueMicrotask(() => {
        if (m) setOrders([]);
      });
      return () => {
        m = false;
      };
    }
    geologyTaxonomyService.getOrdersByClass(form.class_id).then((res) => {
      if (m && res.success && Array.isArray(res.data)) setOrders(res.data);
    });
    return () => {
      m = false;
    };
  }, [form.class_id, showTaxonomy]);

  useEffect(() => {
    let m = true;
    if (!showTaxonomy) {
      queueMicrotask(() => {
        if (m) setFamilies([]);
      });
      return () => {
        m = false;
      };
    }
    if (!form.order_id) {
      queueMicrotask(() => {
        if (m) setFamilies([]);
      });
      return () => {
        m = false;
      };
    }
    geologyTaxonomyService.getFamiliesByOrder(form.order_id).then((res) => {
      if (m && res.success && Array.isArray(res.data)) setFamilies(res.data);
    });
    return () => {
      m = false;
    };
  }, [form.order_id, showTaxonomy]);

  useEffect(() => {
    let m = true;
    if (!showTaxonomy) {
      queueMicrotask(() => {
        if (m) setGenera([]);
      });
      return () => {
        m = false;
      };
    }
    if (!form.family_id) {
      queueMicrotask(() => {
        if (m) setGenera([]);
      });
      return () => {
        m = false;
      };
    }
    geologyTaxonomyService.getGeneraByFamily(form.family_id).then((res) => {
      if (m && res.success && Array.isArray(res.data)) setGenera(res.data);
    });
    return () => {
      m = false;
    };
  }, [form.family_id, showTaxonomy]);

  useEffect(() => {
    let m = true;
    if (!showTaxonomy || !showSpecies) {
      queueMicrotask(() => {
        if (m) setSpecies([]);
      });
      return () => {
        m = false;
      };
    }
    if (!form.genus_id) {
      queueMicrotask(() => {
        if (m) setSpecies([]);
      });
      return () => {
        m = false;
      };
    }
    geologyTaxonomyService.getSpeciesByGenus(form.genus_id).then((res) => {
      if (m && res.success && Array.isArray(res.data)) setSpecies(res.data);
    });
    return () => {
      m = false;
    };
  }, [form.genus_id, showSpecies, showTaxonomy]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onEraChange = (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, era_id: v, period_id: '' }));
  };

  const onKingdomChange = (e) => {
    const v = e.target.value;
    setForm((f) => ({
      ...f,
      kingdom_id: v,
      phylum_id: '',
      class_id: '',
      order_id: '',
      family_id: '',
      genus_id: '',
      species_id: '',
    }));
  };

  const onPhylumChange = (e) => {
    const v = e.target.value;
    setForm((f) => ({
      ...f,
      phylum_id: v,
      class_id: '',
      order_id: '',
      family_id: '',
      genus_id: '',
      species_id: '',
    }));
  };

  const onClassChange = (e) => {
    const v = e.target.value;
    setForm((f) => ({
      ...f,
      class_id: v,
      order_id: '',
      family_id: '',
      genus_id: '',
      species_id: '',
    }));
  };

  const onOrderChange = (e) => {
    const v = e.target.value;
    setForm((f) => ({
      ...f,
      order_id: v,
      family_id: '',
      genus_id: '',
      species_id: '',
    }));
  };

  const onFamilyChange = (e) => {
    const v = e.target.value;
    setForm((f) => ({
      ...f,
      family_id: v,
      genus_id: '',
      species_id: '',
    }));
  };

  const onGenusChange = (e) => {
    const v = e.target.value;
    setForm((f) => ({
      ...f,
      genus_id: v,
      species_id: '',
    }));
  };

  return (
    <>
      <hr className="np-rule" style={{ margin: '22px 0' }} />
      <p className="workspace-page__kicker" style={{ marginBottom: 8 }}>
        Tiempo geológico
      </p>
      <p className="workspace-muted" style={{ marginBottom: 12, fontSize: '0.9rem' }}>
        Asigne era y período (p. ej. Mesozoico → Cretácico) según el catálogo del sistema.
      </p>
      <div className="workspace-form__row">
        <div>
          <label htmlFor={`${idPrefix}era`}>Era geológica</label>
          <select id={`${idPrefix}era`} value={form.era_id} onChange={onEraChange} disabled={disabled}>
            <option value="">—</option>
            {eras.map((er) => (
              <option key={er.id} value={String(er.id)}>
                {er.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}period`}>Período geológico</label>
          <select id={`${idPrefix}period`} value={form.period_id} onChange={set('period_id')} disabled={disabled || !form.era_id}>
            <option value="">—</option>
            {periods.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <hr className="np-rule" style={{ margin: '22px 0' }} />
      <p className="workspace-page__kicker" style={{ marginBottom: 8 }}>
        Clasificación taxonómica
      </p>
      {showTaxonomy ? (
        <p className="workspace-muted" style={{ marginBottom: 12, fontSize: '0.9rem' }}>
          Niveles jerárquicos (reino a especie). Seleccione en orden; el catálogo se filtra en cada paso.
        </p>
      ) : (
        <p className="workspace-muted" style={{ marginBottom: 12, fontSize: '0.9rem' }}>
          Esta categoría no usa taxonomía biológica (reino a especie). Podés dejar este bloque vacío.
        </p>
      )}
      {showTaxonomy ? (
        <>
      <div className="workspace-form__row">
        <div>
          <label htmlFor={`${idPrefix}kingdom`}>Reino</label>
          <select id={`${idPrefix}kingdom`} value={form.kingdom_id} onChange={onKingdomChange} disabled={disabled}>
            <option value="">—</option>
            {kingdoms.map((k) => (
              <option key={k.id} value={String(k.id)}>
                {k.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}phylum`}>Filo</label>
          <select id={`${idPrefix}phylum`} value={form.phylum_id} onChange={onPhylumChange} disabled={disabled || !form.kingdom_id}>
            <option value="">—</option>
            {phylums.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="workspace-form__row" style={{ marginTop: 14 }}>
        <div>
          <label htmlFor={`${idPrefix}class`}>Clase</label>
          <select id={`${idPrefix}class`} value={form.class_id} onChange={onClassChange} disabled={disabled || !form.phylum_id}>
            <option value="">—</option>
            {classes.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}order`}>Orden</label>
          <select id={`${idPrefix}order`} value={form.order_id} onChange={onOrderChange} disabled={disabled || !form.class_id}>
            <option value="">—</option>
            {orders.map((o) => (
              <option key={o.id} value={String(o.id)}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="workspace-form__row" style={{ marginTop: 14 }}>
        <div>
          <label htmlFor={`${idPrefix}family`}>Familia</label>
          <select id={`${idPrefix}family`} value={form.family_id} onChange={onFamilyChange} disabled={disabled || !form.order_id}>
            <option value="">—</option>
            {families.map((fa) => (
              <option key={fa.id} value={String(fa.id)}>
                {fa.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}genus`}>Género</label>
          <select id={`${idPrefix}genus`} value={form.genus_id} onChange={onGenusChange} disabled={disabled || !form.family_id}>
            <option value="">—</option>
            {genera.map((g) => (
              <option key={g.id} value={String(g.id)}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {showSpecies ? (
        <div className="workspace-form__row" style={{ marginTop: 14 }}>
          <div>
            <label htmlFor={`${idPrefix}species`}>Especie / Grupo amplio</label>
            <select id={`${idPrefix}species`} value={form.species_id} onChange={set('species_id')} disabled={disabled || !form.genus_id}>
              <option value="">—</option>
              {species.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                  {s.common_name ? ` (${s.common_name})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
        </>
      ) : null}
    </>
  );
}
