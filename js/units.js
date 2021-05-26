String.prototype.getMeasure = function() {
    let regexp;
    let str = this;

    if(this.includes(',') || this.includes('.'))
    {
        str = str.replace(',', '.');
        regexp = new RegExp(/[0-9]+\.[0-9]+(ml|g|l|kg|dag)/, 'g');
    }
    else
    {
        regexp = new RegExp(/[0-9]+(ml|g|l|kg|dag)/, 'g');
    }

    return str.match(regexp);
};

String.prototype.getUnits = function() {
    const regexp = new RegExp(/(ml|l|g|dag|kg)/, 'g');
    
    return this.match(regexp);
};

String.prototype.getValue = function() {
    let regexp;
    
    if(this.includes('.'))
    {
        regexp = new RegExp(/[0-9]+\.[0-9]*/, 'g');
    }
    else
    {
        regexp = new RegExp(/[0-9]*/);
    }

    return parseFloat(this.match(regexp));
};

const ToSIUnits = (value, unit) => {
    if(unit == 'g')
    {
        value = value / 1000;
        unit = 'kg';
    }
    else if(unit == 'dag')
    {
        value = value / 100;
        unit = 'kg';
    }
    else if(unit == 'ml')
    {
        value = value / 1000 
        unit =  'l';
    }

    return {value: value, unit: unit};
}

const calcPriceForLOrKg = (value, price) => {
    if(value == 1)
        return false;

    const p = price / value;
    let res = Math.round(p * 100) / 100;
    const int_part = Math.trunc(res);
    const float_part = Number((res - int_part).toFixed(2));

    if(float_part == 0.0)
        res = `${int_part}.00`;
    else if(float_part == 0.1 || float_part == 0.2 || float_part == 0.3 || float_part == 0.4 || float_part == 0.5 || float_part == 0.6 || float_part == 0.7 || float_part == 0.8 || float_part == 0.9)
        res = `${int_part + float_part}0`;

    return res;
}

module.exports.calcPriceForLOrKg = calcPriceForLOrKg;
module.exports.ToSIUnits = ToSIUnits;