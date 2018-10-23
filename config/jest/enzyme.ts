import enzyme from 'enzyme';
import enzymeAdapterReact16 from 'enzyme-adapter-react-16';

enzyme.configure({ adapter: new enzymeAdapterReact16() });
