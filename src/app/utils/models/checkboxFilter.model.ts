import { FormControl } from "@angular/forms";

export interface Filters {
    id: string;
    nome: string;
    selecionado:  boolean;
    control: FormControl;
    cor: string;
    subFiltros?: Filters[];
}