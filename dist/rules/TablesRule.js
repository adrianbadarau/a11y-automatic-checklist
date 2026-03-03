import { A11yRule } from './Rule.js';
export class TablesRule extends A11yRule {
    id = 10;
    description = 'Data and Layout Tables';
    selector = 'table, th, td';
    promptText = '10. Tables: Data tables MUST NOT be used for pure visual layout. Data tables MUST have `<th>` headers with accurate category descriptions, correctly associated with data cells using `scope="col"` or `scope="row"`. A meaningful `<caption>` must describe the purpose of the table uniquely within the page.';
}
