export class Variable {
    key: string;
    value: string | boolean | number;
    constructor(key: string, value: string | boolean | number) {
        this.key = key
        this.value = value
    }
}

export const defaultVariables = [
    new Variable("version", "1.4.6"),
    new Variable("version_ascii", `\
:::    ::: ::::::::  ::::    :::  ::::::::   ::::::::  :::        :::::::::: 
:+:   :+: :+:    :+: :+:+:   :+: :+:    :+: :+:    :+: :+:        :+:        
+:+  +:+  +:+    +:+ :+:+:+  +:+ +:+        +:+    +:+ +:+        +:+        
+#++:++   +#+    +:+ +#+ +:+ +#+ +#++:++#++ +#+    +:+ +#+        +#++:++#   
+#+  +#+  +#+    +#+ +#+  +#+#+#        +#+ +#+    +#+ +#+        +#+        
#+#   #+# #+#    #+# #+#   #+#+# #+#    #+# #+#    #+# #+#        #+#        
###    ### ########  ###    ####  ########   ########  ########## ########## `),
    new Variable("ascii_gen", "https://patorjk.com/software/taag/"),
    new Variable("branch", "experimental-ts")
]