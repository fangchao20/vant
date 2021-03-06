import { PropType, ref } from 'vue';

// Utils
import { ComponentInstance, createNamespace } from '../utils';
import { isAndroid } from '../utils/validate/system';

// Components
import Cell from '../cell';
import Field from '../field';

const [createComponent, bem, t] = createNamespace('address-edit-detail');
const android = isAndroid();

export type AddressEditSearchItem = {
  name: string;
  address: string;
};

export default createComponent({
  props: {
    show: Boolean,
    value: String,
    focused: Boolean,
    detailRows: [Number, String],
    searchResult: Array as PropType<AddressEditSearchItem[]>,
    errorMessage: String,
    detailMaxlength: [Number, String],
    showSearchResult: Boolean,
  },

  emits: ['blur', 'focus', 'input', 'select-search'],

  setup(props, { emit }) {
    const field = ref<ComponentInstance>();

    const showSearchResult = () =>
      props.focused && props.searchResult && props.showSearchResult;

    const onSelect = (express: AddressEditSearchItem) => {
      emit('select-search', express);
      emit('input', `${express.address || ''} ${express.name || ''}`.trim());
    };

    const onFinish = () => {
      field.value!.blur();
    };

    const renderFinish = () => {
      if (props.value && props.focused && android) {
        return (
          <div class={bem('finish')} onClick={onFinish}>
            {t('complete')}
          </div>
        );
      }
    };

    const renderSearchTitle = (express: AddressEditSearchItem) => {
      if (express.name) {
        const text = express.name.replace(
          props.value!,
          `<span class=${bem('keyword')}>${props.value}</span>`
        );

        return <div innerHTML={text} />;
      }
    };

    const renderSearchResult = () => {
      if (!showSearchResult()) {
        return;
      }

      const { searchResult } = props;
      return searchResult!.map((express) => (
        <Cell
          v-slots={{
            title: () => renderSearchTitle(express),
          }}
          clickable
          key={express.name + express.address}
          icon="location-o"
          label={express.address}
          class={bem('search-item')}
          border={false}
          onClick={() => onSelect(express)}
        />
      ));
    };

    const onBlur = (event: Event) => emit('blur', event);
    const onFocus = (event: Event) => emit('focus', event);
    const onInput = (value: string) => emit('input', value);

    return () => {
      if (props.show) {
        return (
          <>
            <Field
              v-slots={{ icon: renderFinish }}
              autosize
              ref={field}
              class={bem()}
              rows={props.detailRows}
              type="textarea"
              label={t('label')}
              border={!showSearchResult()}
              clearable={!android}
              maxlength={props.detailMaxlength}
              modelValue={props.value}
              placeholder={t('placeholder')}
              errorMessage={props.errorMessage}
              onBlur={onBlur}
              onFocus={onFocus}
              {...{ 'onUpdate:modelValue': onInput }}
            />
            {renderSearchResult()}
          </>
        );
      }
    };
  },
});
